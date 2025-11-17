require('dotenv').config();
const mongoose = require('mongoose');
const Interaction = require('./models/Interaction');
const drugInteractionsData = require('./data/drugInteractions.json');

const seedInteractions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await Interaction.deleteMany();
        console.log('Existing interactions cleared.');

        // Insert new data
        await Interaction.insertMany(drugInteractionsData);
        console.log('Drug interactions seeded successfully!');

        mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit();
    } catch (error) {
        console.error('Error seeding drug interactions:', error);
        process.exit(1);
    }
};

seedInteractions();
