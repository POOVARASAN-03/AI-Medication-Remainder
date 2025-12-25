const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK using environment variables
let serviceAccount;
try {
  // Try to create service account from environment variables first (production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
    console.log('✅ Firebase Admin SDK configured from environment variables');
  } else {
    // Fallback to serviceAccountKey.json for local development
    serviceAccount = require('../serviceAccountKey.json');
    console.log('⚠️  Firebase Admin SDK configured from serviceAccountKey.json (local development)');
  }
} catch (error) {
  console.error('❌ Error loading Firebase credentials. FCM will not work.');
  console.error('Please set FIREBASE_* environment variables or ensure serviceAccountKey.json exists.');
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
  }
}

const sendPushNotification = async (fcmToken, title, body, reminderHistoryId, authToken) => {
  if (!serviceAccount) {
    console.error('FCM not initialized: Missing Firebase credentials');
    return;
  }

  if (!fcmToken) {
    console.error('Error: No FCM token provided');
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5001';

  const message = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: '/vite.svg',
        actions: [
          { action: 'taken', title: '✅ Taken' },
          { action: 'missed', title: '❌ Missed' }
        ],
        click_action: clientUrl,
      },
      headers: {
        Urgency: 'high',
      },
    },
    data: { // Data payload is always sent, notification payload depends on client state
      reminderHistoryId: reminderHistoryId,
      statusEndpoint: `${serverUrl}/api/reminders/`,
      authToken: authToken, // Include the auth token here
      // The click_action for webpush notifications is now in webpush.notification directly
      // For other client types (e.g. Android/iOS), you might still want a top-level click_action in data.
      // For now, we rely on webpush.notification.click_action and service worker for background clicks.
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    // Don't throw error to prevent crashing the calling process, just log it
    return null;
  }
};

module.exports = { sendPushNotification };