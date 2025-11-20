const axios = require('axios');
const Prescription = require('../models/Prescription');
const medicineDictionary = require('../data/medicineDictionary.json');
const drugInteractionsData = require('../data/drugInteractions.json');
const commonMedicineNames = require('../data/commonMedicineNames.json'); // New import
const uploadToCloudinary = require('../utils/cloudinaryUpload');// Configure Cloudinary
const Reminder = require('../models/Reminder'); // Added Reminder model import


// Placeholder for medicine extraction logic (implement this)
function cleanOCRText(text) {
  return text
    .replace(/(\d)-(\d)/g, "$1-$2")
    .replace(/for\s+days\s+(\d+)/gi, "$1 days")
    .replace(/days\s+for\s+(\d+)/gi, "$1 days")
    .replace(/for\s+(\d+)\s+days/gi, "$1 days")
    .replace(/(\d+)-(\d+)-(\d+)-/g, "$1-$2-$3-0")
    .replace(/(\d+)-(\d+)-(\d+)/g, "$1-$2-$3-0")
    .replace(/(\d+)for/gi, "$1 for")
    .replace(/(\d+)(days)/gi, "$1 days")
    .replace(/\s+/g, " ")
    .trim();
}

function buildMedicineRegex(dictionary, commonNames) {
  const allNames = [
    ...dictionary.map(m => ({
      name: m,
      isCommon: false
    })),
    ...commonNames.map(cn => ({
      name: cn.commonName,
      isCommon: true
    }))
  ].sort((a, b) => b.name.length - a.name.length); // Prioritize longer names

  const escapedNames = allNames.map(item => item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?=\\b(${escapedNames.join("|")})\\b)`, "gi");
}

const extractMedicineDetails = (rawText) => {
  const text = cleanOCRText(rawText);

  const medicineRegex = buildMedicineRegex(medicineDictionary, commonMedicineNames); // Pass common names

  // STEP 1 — Split text by all dynamic medicine names
  const parts = text.split(medicineRegex);
  const names = (text.match(medicineRegex) || []).map(match => match.trim()); // Trim matched names

  let segments = [];

  // STEP 2 — Reattach names to their segment
  // Handle cases where a matched name might be followed by other medicine details
  for (let i = 0; i < parts.length; i++) {
    if (names[i]) {
      // Find the dictionary name for the matched common name, if it exists
      const dictName = commonMedicineNames.find(cn => cn.commonName.toLowerCase() === names[i].toLowerCase());
      const actualName = dictName ? dictName.dictionaryName : names[i];
      segments.push((actualName + " " + parts[i]).trim());
    } else {
      segments.push(parts[i].trim());
    }
  }

  // STEP 3 — Remove duplicates and blank entries
  segments = [...new Set(segments.filter(s => s.length > 5))];

  const medicines = [];
  const extractedNames = new Set();

  segments.forEach(segment => {
    // Must contain dosage, otherwise skip duplicates
    if (!segment.match(/\d+\s*(mg|mcg|g)/i) &&
      !(segment.toLowerCase().includes("stat") && segment.match(/\d+\s*gm/i))) return; // Allow 'Stat' with 'gm' for Para

    let medName = null;
    // Try to find an exact match from the dictionary first
    medName = medicineDictionary.find(m =>
      new RegExp(`\\b${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, 'i').test(segment)
    );

    if (!medName) {
      // If not found, try to find a match from common names and map to dictionary name
      const commonMatch = commonMedicineNames.find(cn =>
        new RegExp(`\\b${cn.commonName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, 'i').test(segment)
      );
      if (commonMatch) {
        medName = commonMatch.dictionaryName;
      }
    }

    if (!medName) return;

    const dosageCandidate = segment.match(/(\d+\s*(mg|mcg|g|gm))/i); // Added 'gm' to dosage regex
    const frequencyCandidate = segment.match(/\b(\d+-\d+-\d+-\d+|\d+-\d+-\d+|\d+-\d+|Stat)\b/i); // Added 'Stat'
    const durationCandidate = segment.match(/(\d+)\s*days/i);

    if (medName) {
      medicines.push({
        name: medName,
        dosage: dosageCandidate ? dosageCandidate[1].trim() : "",
        frequency: frequencyCandidate ? frequencyCandidate[1].trim().replace(/stat/i, "Stat") : "", // Normalize Stat
        duration: durationCandidate ? `${parseInt(durationCandidate[1])} days` : "", // Remove leading zeros
      });
      extractedNames.add(medName.toLowerCase());
    }
  });

  // Fallback / secondary pass for names that might have been missed by the main regex
  // This handles cases where dosage/frequency/duration might be on separate lines or less structured
  // This section needs to be updated to use commonMedicineNames as well
  const allPossibleMedNames = [
    ...medicineDictionary,
    ...commonMedicineNames.map(cn => cn.dictionaryName)
  ].filter((value, index, self) => self.indexOf(value) === index); // Unique names

  allPossibleMedNames.forEach(dictMed => {
    const normalizedDictMed = dictMed.toLowerCase();
    if (!extractedNames.has(normalizedDictMed) && text.toLowerCase().includes(normalizedDictMed)) {
      // Attempt to find the full line containing this medicine
      const lineMatch = new RegExp(`.*${dictMed}.*`, 'i').exec(text);
      if (lineMatch) {
        const segment = cleanOCRText(lineMatch[0]); // Clean the matched line

        // Re-attempt extraction of details from this specific line
        const dosageMatch = segment.match(/(\d+\s*(?:mg|mcg|g|gm))/i);
        const frequencyMatch = segment.match(/\b(\d+-\d+-\d+-\d+|\d+-\d+-\d+|\d+-\d+|Stat)\b/i);
        const durationMatch = segment.match(/(\d+)\s*days/i);

        medicines.push({
          name: dictMed,
          dosage: dosageMatch ? dosageMatch[1].trim() : "",
          frequency: frequencyMatch ? frequencyMatch[1].trim().replace(/stat/i, "Stat") : "",
          duration: durationMatch ? `${parseInt(durationMatch[1])} days` : "",
        });
        extractedNames.add(normalizedDictMed);
      }
    }
  });

  return medicines;
};

function parseFrequency(freq) {
  if (!freq || freq.trim() === "") return [0, 0, 0, 0];
  if (freq.toLowerCase() === "stat") return [1, 0, 0, 0]; // 'Stat' implies immediate/morning dose

  let parts = freq.split("-").map(n => parseInt(n || 0));
  while (parts.length < 4) parts.push(0);

  return parts;
}

function hasFrequencyOverlap(freq1, freq2) {
  const f1 = parseFrequency(freq1);
  const f2 = parseFrequency(freq2);

  for (let i = 0; i < 4; i++) {
    if (f1[i] > 0 && f2[i] > 0) return true;
  }
  return false;
}

const normalizeName = (name) =>
  name.toLowerCase().trim().replace(/^(tab|cap|tablet|capsule)\s*/i, "");

// Frequency mapping for reminder times
const frequencyTimes = {
  0: "08:00", // Morning
  1: "13:00", // Afternoon
  2: "18:00", // Evening
  3: "21:00", // Night
};

// Helper to parse frequency string like "1-0-1-0" into an array [1, 0, 1, 0]
function parseFrequencyForReminders(freq) {
  if (!freq || freq.trim() === "") return [0, 0, 0, 0];
  const parts = freq.split("-").map(n => parseInt(n || 0));
  while (parts.length < 4) parts.push(0); // Ensure 4 parts (M, A, E, N)
  return parts;
}

// Auto-Reminder Generator
const autoCreateReminders = async (prescription, user) => {
  const remindersToCreate = [];
  const today = new Date();
  const startDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

  for (const medicine of prescription.medicines) {
    if (!medicine.frequency || !medicine.duration) continue; // Skip if essential data is missing

    const freqArray = parseFrequencyForReminders(medicine.frequency);
    const durationDaysMatch = medicine.duration.match(/(\d+)\s*days/i);
    const durationDays = durationDaysMatch ? parseInt(durationDaysMatch[1]) : 0;

    if (durationDays === 0) continue; // Skip if duration is not valid

    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + durationDays);
    const endDate = endDateObj.toISOString().split('T')[0]; // YYYY-MM-DD

    for (let i = 0; i < freqArray.length; i++) {
      if (freqArray[i] > 0) { // If there's a dosage for this time slot
        remindersToCreate.push({
          user: user._id,
          prescription: prescription._id,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          time: frequencyTimes[i],
          startDate: startDate,
          endDate: endDate,
          notifyBy: user.notificationMethod,
          whatsappNumber: user.whatsappNumber,
          email: user.email,
          status: 'active',
        });
      }
    }
  }

  if (remindersToCreate.length > 0) {
    await Reminder.insertMany(remindersToCreate);
    console.log(`Automatically created ${remindersToCreate.length} reminders.`);
  }
};

// MAIN FUNCTION
const checkDrugInteractions = (medicines) => {
  const interactions = [];

  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      
      const m1 = normalizeName(medicines[i].name);
      const m2 = normalizeName(medicines[j].name);

      const freq1 = medicines[i].frequency;
      const freq2 = medicines[j].frequency;

      // 1. Check if pair exists in your JSON
      const found = drugInteractionsData.find(int => {
        const i1 = normalizeName(int.med1);
        const i2 = normalizeName(int.med2);
        return (i1 === m1 && i2 === m2) || (i1 === m2 && i2 === m1);
      });

      if (!found) continue;

      // 2. Check frequency overlap
      const overlap = hasFrequencyOverlap(freq1, freq2);

      if (!overlap) continue;

      // 3. Add interaction result
      interactions.push({
        med1: found.med1,
        med2: found.med2,
        severity: found.severity,
        note: found.note,
        overlapTimes: [
          { time: "Morning", conflict: parseFrequency(freq1)[0] > 0 && parseFrequency(freq2)[0] > 0 },
          { time: "Afternoon", conflict: parseFrequency(freq1)[1] > 0 && parseFrequency(freq2)[1] > 0 },
          { time: "Evening", conflict: parseFrequency(freq1)[2] > 0 && parseFrequency(freq2)[2] > 0 },
          { time: "Night", conflict: parseFrequency(freq1)[3] > 0 && parseFrequency(freq2)[3] > 0 },
        ]
      });
    }
  }

  return interactions;
};

// @desc    Upload prescription image, analyze it, and save details
// @route   POST /api/prescriptions/upload
// @access  Private
const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // 1. Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = cloudinaryResult.secure_url;

    // 2. Send Cloudinary URL to Python OCR
    const ocrResponse = await axios.post(`${process.env.PYTHON_OCR_URL}/ocr`, {
      imageUrl,
    });

    const extractedText = ocrResponse.data.text;
    console.log('OCR Extracted Text:', extractedText); // Debug log

    // 3. Extract medicines
    const medicines = extractMedicineDetails(extractedText);
    console.log('Extracted Medicines:', medicines); // Debug log

    // 4. Drug interactions
    const interactions = checkDrugInteractions(medicines);
    console.log('Detected Interactions:', interactions); // Debug log

    // 5. Save to DB
    const prescription = await Prescription.create({
      user: req.user._id,
      image: imageUrl,
      extractedText,
      medicines,
      interactions,
    });

    // 6. Auto-create reminders
    // if (req.user) {
    //   await autoCreateReminders(prescription, req.user);
    // }

    return res.status(201).json({
      message: 'Prescription uploaded and analyzed successfully',
      prescription,
    });

  } catch (error) {
    console.error('UPLOAD/ANALYSIS ERROR:', error);
    return res.status(500).json({
      message: 'Server error during upload or analysis',
      error: error.message,
    });
  }
};

// @desc    Get all prescriptions for a user
// @route   GET /api/prescriptions
// @access  Private
const getUserPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Ensure the prescription belongs to the authenticated user
        if (prescription.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this prescription' });
        }

        res.status(200).json(prescription);
    } catch (error) {
        console.error('Error fetching prescription by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadPrescription, getUserPrescriptions, getPrescriptionById };
