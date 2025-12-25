importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
importScripts('/firebase-config-sw.js');

firebase.initializeApp(self.FIREBASE_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);
  console.log('Payload data from FCM:', payload.data);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/vite.svg',
    badge: '/vite.svg',
    tag: 'medication-reminder',
    requireInteraction: true, // Forces notification to stay until user interacts
    vibrate: [200, 100, 200],
    data: { // This data object is what becomes event.notification.data
      url: payload.data.click_action || self.API_URL || 'http://localhost:3000',
      reminderHistoryId: payload.data.reminderHistoryId,
      statusEndpoint: payload.data.statusEndpoint,
      authToken: payload.data.authToken, // Include authToken
    },
    actions: [
      { action: 'taken', title: '✅ Taken' },
      { action: 'missed', title: '❌ Missed' }
    ]
  };

  console.log('Showing notification with:', notificationTitle, notificationOptions);

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification clicked', event);
  event.notification.close();

  // Safely access data, accounting for FCM_MSG nesting
  let notificationData = {};
  if (event.notification.data) {
    if (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.data) {
      // For some browsers/FCM versions, data might be nested under FCM_MSG.data
      notificationData = event.notification.data.FCM_MSG.data;
    } else {
      // For others, it might be directly on event.notification.data
      notificationData = event.notification.data;
    }
  }

  console.log('Parsed notification data for click:', notificationData); // <-- Updated logging

  const reminderHistoryId = notificationData.reminderHistoryId;
  const statusEndpoint = notificationData.statusEndpoint;
  const authToken = notificationData.authToken; // Extract authToken

  if (event.action === 'taken' || event.action === 'missed') {
    if (!reminderHistoryId || !statusEndpoint || !authToken) {
      console.error('Missing reminderHistoryId, statusEndpoint, or authToken in notification data.');
      self.registration.showNotification('Medication Reminder', {
        body: 'Could not update status: missing reminder info.',
        icon: '/vite.svg',
      });
      return;
    }

    event.waitUntil(
      fetch(`${statusEndpoint}${reminderHistoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Use the extracted authToken
        },
        body: JSON.stringify({ status: event.action }),
      })
        .then(response => {
          if (response.ok) {
            console.log(`Reminder ${reminderHistoryId} marked as ${event.action}`);
            self.registration.showNotification('Medication Reminder', {
              body: `Your medication was marked as ${event.action}!`, // Feedback notification
              icon: '/vite.svg',
            });
          } else {
            console.error(`Failed to update reminder status: ${response.status} ${response.statusText}`);
            self.registration.showNotification('Medication Reminder', {
              body: `Failed to update medication status. Status: ${response.status}.` + (response.status === 401 ? ' (Login required)' : ''),
              icon: '/vite.svg',
            });
          }
        })
        .catch(error => {
          console.error('Error sending status update:', error);
          self.registration.showNotification('Medication Reminder', {
            body: 'Network error: Could not update medication status.',
            icon: '/vite.svg',
          });
        })
    );
  } else {
    // Default behavior for clicking the notification body or other actions
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
        // Handle opening the app or focusing existing tab
        const clickUrl = notificationData.url || self.API_URL || 'http://localhost:3000'; // Use data.url
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url.includes(clickUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(clickUrl);
        }
      })
    );
  }
});