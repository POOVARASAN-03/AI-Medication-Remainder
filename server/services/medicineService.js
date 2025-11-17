const medicineDictionary = require('../data/medicineDictionary.json');

const extractMedicines = (rawText) => {
    const extracted = [];
    const lines = rawText.split(/\r?\n/);

    const dosageRegex = /(\d+)(?:\s*(mg|g|ml))?/i;
    const frequencyRegex = /(?:(\d+)-(\d+)-(\d+)|(once|twice|thrice)\s*a\s*day|(?:every|each)\s*(\d+)\s*(?:hour|day|week|month)s?)/i;
    const durationRegex = /(?:for\s+)?(\d+)\s*(day|week|month|year)s?/i;

    for (const line of lines) {
        // Try to find a medicine name first
        let medicineName = null;
        for (const med of medicineDictionary) {
            if (line.toLowerCase().includes(med.toLowerCase())) {
                medicineName = med;
                break;
            }
        }

        if (medicineName) {
            const dosageMatch = line.match(dosageRegex);
            const frequencyMatch = line.match(frequencyRegex);
            const durationMatch = line.match(durationRegex);

            extracted.push({
                name: medicineName,
                dosage: dosageMatch ? dosageMatch[0] : '',
                frequency: frequencyMatch ? frequencyMatch[0] : '',
                duration: durationMatch ? durationMatch[0] : '',
            });
        }
    }
    return extracted;
};

module.exports = { extractMedicines };
