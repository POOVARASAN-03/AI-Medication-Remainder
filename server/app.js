const dotenv = require('dotenv');
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('ERROR: JWT_SECRET must be set and at least 32 characters long');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI must be set');
    process.exit(1);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cron = require('node-cron');
const authRoutes = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Reminder = require('./models/Reminder');
const ReminderHistory = require('./models/ReminderHistory');
const User = require('./models/User'); // Import User model
const { sendEmail, sendWhatsAppReminder } = require('./services/notificationService'); // Import notification service

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Cron job for reminders
cron.schedule('* * * * *', async () => {
    console.log('Running reminder check cron job...');

    const now = new Date();

    // Normalize time → "HH:MM"
    const currentTime = now
        .toLocaleTimeString('en-US', { hour12: false })
        .slice(0, 5);

    // Normalize date → "YYYY-MM-DD"
    const currentDay = now.toISOString().split('T')[0];

    try {
        // 🔥 1. Auto-mark expired reminders
        await Reminder.updateMany(
            { endDate: { $lt: currentDay }, status: "active" }, // Use correct endDate field
            { status: "expired" }
        );

        // 🔥 2. Find reminders due right now
        const dueReminders = await Reminder.find({
            status: 'active',
            startDate: { $lte: currentDay },
            endDate: { $gte: currentDay },
            time: currentTime, // Match time from Reminder model
        }).populate('user'); // Populate user data to get notification preferences

        // 🔥 3. Trigger reminders
        for (const reminder of dueReminders) {
            if (!reminder.user) {
                console.log(`User not found for reminder ${reminder._id}. Skipping.`);
                continue;
            }

            if (!reminder.user.enableNotifications) {
                console.log(`Notifications disabled for user ${reminder.user._id}.`);
                continue;
            }

            let notificationStatus = 'failed';
            let notificationMethodUsed = 'none';

            const userName = reminder.user.name.split(' ')[0]; // First name
            const slotName = reminder.time === '08:00' ? 'Morning' : reminder.time === '13:00' ? 'Afternoon' : reminder.time === '18:00' ? 'Evening' : 'Night';
            const medicineList = `${reminder.medicineName} (${reminder.dosage})`;

            const emailSubject = `Medication Reminder: ${reminder.medicineName}`;
            const emailBody = `Hi ${userName},

It's time to take your ${slotName} medication:
- ${reminder.medicineName} (Dosage: ${reminder.dosage})

Please take it at ${reminder.time}.

Thank you!`;

            try {
                if (reminder.notifyBy === 'whatsapp' || reminder.notifyBy === 'both') {
                    if (reminder.whatsappNumber) {
                        const whatsappTo = reminder.whatsappNumber.startsWith("whatsapp:")
                            ? reminder.whatsappNumber
                            : `whatsapp:${reminder.whatsappNumber}`;

                        await sendWhatsAppReminder(
                            whatsappTo,
                            userName,
                            slotName,
                            medicineList
                        );

                        notificationStatus = 'sent';
                        notificationMethodUsed =
                            notificationMethodUsed === 'email' ? 'both' : 'whatsapp';
                    } else {
                        console.warn(
                            `Reminder ${reminder._id} has WhatsApp enabled but no number.`
                        );
                    }
                }
            } catch (notifyError) {
                console.error(`Error sending notification for reminder ${reminder._id}:`, notifyError);
                // If one method fails, still try the other, and status remains 'failed' unless one succeeds
            }

            await ReminderHistory.create({
                user: reminder.user._id,
                reminder: reminder._id,
                medicineName: reminder.medicineName,
                scheduledTime: reminder.time,
                triggerDate: now,
                status: notificationStatus, // Use actual notification status
                notificationMethod: notificationMethodUsed,
            });

            console.log(`Reminder processed for ${reminder.medicineName} to user ${reminder.user._id} via ${notificationMethodUsed} with status: ${notificationStatus}`);
        }

    } catch (error) {
        console.error('Error in reminder cron job:', error);
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
