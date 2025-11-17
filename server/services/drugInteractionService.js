const Interaction = require('../models/Interaction');

const checkDrugInteractions = async (extractedMedicines) => {
    const interactionsFound = [];
    const medicineNames = extractedMedicines.map(med => med.name);

    if (medicineNames.length < 2) {
        return interactionsFound; // No interactions possible with less than 2 medicines
    }

    for (let i = 0; i < medicineNames.length; i++) {
        for (let j = i + 1; j < medicineNames.length; j++) {
            const med1 = medicineNames[i];
            const med2 = medicineNames[j];

            // Check for interaction in both directions (med1-med2 and med2-med1) from MongoDB
            const interaction = await Interaction.findOne({
                $or: [
                    { med1: { $regex: new RegExp(`^${med1}$`, 'i') }, med2: { $regex: new RegExp(`^${med2}$`, 'i') } },
                    { med1: { $regex: new RegExp(`^${med2}$`, 'i') }, med2: { $regex: new RegExp(`^${med1}$`, 'i') } },
                ],
            });

            if (interaction) {
                interactionsFound.push({
                    med1: med1,
                    med2: med2,
                    severity: interaction.severity,
                    note: interaction.note,
                });
            }
        }
    }
    return interactionsFound;
};

module.exports = { checkDrugInteractions };
