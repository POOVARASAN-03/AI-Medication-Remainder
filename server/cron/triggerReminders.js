const Reminder = require('../models/Reminder');
const ReminderHistory = require('../models/ReminderHistory');
const { sendPushNotification } = require('../services/fcmService');
const jwt = require('jsonwebtoken');

/**
 * Function to trigger reminders for active prescriptions
 * This can be called by cron job or manually via API endpoint
 */
const triggerActiveReminders = async () => {
    console.log('🔔 Running reminder check...');

    const now = new Date();

    // Convert UTC time to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    // Normalize IST time → "HH:MM"
    const currentTime = istTime
        .toISOString()
        .slice(11, 16); // Extract HH:MM from ISO string

    // Normalize date → "YYYY-MM-DD" (IST date)
    const currentDay = istTime.toISOString().split('T')[0];

    console.log('⏰ Current IST time:', currentTime);
    console.log('📅 Current IST date:', currentDay);
    console.log('🌍 UTC time:', now.toISOString());

    try {
        // 🔥 1. Auto-mark expired reminders
        await Reminder.updateMany(
            { endDate: { $lt: currentDay }, status: "active" },
            { status: "expired" }
        );

        // 🔥 2. Find reminders due right now
        const dueReminders = await Reminder.find({
            status: 'active',
            startDate: { $lte: currentDay },
            endDate: { $gte: currentDay },
            time: currentTime,
        }).populate('user');

        console.log(`Found ${dueReminders.length} due reminders`);

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

            // Create ReminderHistory entry initially with 'pending' status
            const reminderHistory = await ReminderHistory.create({
                user: reminder.user._id,
                reminder: reminder._id,
                medicineName: reminder.medicineName,
                scheduledTime: reminder.time,
                triggerDate: now,
                status: 'pending',
                notificationMethod: notificationMethodUsed,
            });

            const reminderHistoryId = reminderHistory._id.toString();

            const userName = reminder.user.name.split(' ')[0];
            const slotName = reminder.time === '08:00' ? 'Morning' : reminder.time === '13:00' ? 'Afternoon' : reminder.time === '17:00' ? 'Evening' : 'Night';

            try {
                // Send FCM Push Notification
                console.log(`Checking FCM token for user ${reminder.user._id}:`, reminder.user.fcmToken ? 'EXISTS' : 'NOT FOUND');
                if (reminder.user.fcmToken) {
                    try {
                        // Generate a short-lived token for service worker to update status
                        const serviceWorkerAuthToken = jwt.sign(
                            { id: reminder.user._id, reminderHistoryId: reminderHistoryId, purpose: 'update_reminder_status' },
                            process.env.JWT_SECRET,
                            { expiresIn: '10m' }
                        );

                        await sendPushNotification(
                            reminder.user.fcmToken,
                            `💊 ${slotName} Medication Reminder`,
                            `Time to take ${reminder.medicineName} (${reminder.dosage})`,
                            reminderHistoryId,
                            serviceWorkerAuthToken
                        );
                        notificationStatus = 'sent';
                        notificationMethodUsed = notificationMethodUsed === 'whatsapp' ? 'both' : 'push';
                        console.log(`✅ FCM notification sent for reminder ${reminder._id}`);
                    } catch (fcmError) {
                        console.error(`❌ Error sending FCM for reminder ${reminder._id}:`, fcmError);
                    }
                } else {
                    console.log(`⚠️ No FCM token found for user ${reminder.user._id}, skipping push notification`);
                }
            } catch (notifyError) {
                console.error(`Error sending notification for reminder ${reminder._id}:`, notifyError);
            }

            // Update the ReminderHistory entry after notification attempts
            reminderHistory.status = notificationStatus;
            reminderHistory.notificationMethod = notificationMethodUsed;
            await reminderHistory.save();

            console.log(`Reminder processed for ${reminder.medicineName} to user ${reminder.user._id} via ${notificationMethodUsed} with status: ${notificationStatus}`);
        }

        return {
            success: true,
            processedCount: dueReminders.length,
            timestamp: now
        };

    } catch (error) {
        console.error('Error in reminder trigger:', error);
        throw error;
    }
};

module.exports = { triggerActiveReminders };
