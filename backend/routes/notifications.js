const express = require('express');
const webpush = require('web-push');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure VAPID keys for web-push
const VAPID_SUBJECT = 'mailto:your-email@runmate.com';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BMxWR8EhxXXX...'; // TODO: Generate real keys
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'your-private-key'; // TODO: Generate real keys

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    // Save subscription to user
    await User.findByIdAndUpdate(userId, {
      pushSubscription: subscription,
      notificationsEnabled: true
    });

    console.log(`Push subscription saved for user ${userId}`);
    res.json({ success: true, message: 'Subscribed to notifications' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
});

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/unsubscribe
// @access  Private
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $unset: { pushSubscription: 1 },
      notificationsEnabled: false
    });

    console.log(`Push subscription removed for user ${userId}`);
    res.json({ success: true, message: 'Unsubscribed from notifications' });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.pushSubscription) {
      return res.status(400).json({ success: false, message: 'No push subscription found' });
    }

    const payload = JSON.stringify({
      title: 'RunMate Test',
      body: 'Detta är en testnotifikation! 🏃‍♂️',
      icon: '/logo.png',
      tag: 'test',
      data: {
        url: '/dashboard'
      }
    });

    await webpush.sendNotification(user.pushSubscription, payload);
    
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// Helper function to send notification to a user
const sendNotificationToUser = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushSubscription || !user.notificationsEnabled) {
      console.log(`No valid push subscription for user ${userId}`);
      return false;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo.png',
      image: notification.image,
      tag: notification.tag || 'runmate',
      data: notification.data || {},
      requireInteraction: notification.requireInteraction || false
    });

    await webpush.sendNotification(user.pushSubscription, payload);
    console.log(`Notification sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    
    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, {
        $unset: { pushSubscription: 1 },
        notificationsEnabled: false
      });
      console.log(`Removed invalid subscription for user ${userId}`);
    }
    
    return false;
  }
};

// Helper function to send notification to multiple users
const sendNotificationToUsers = async (userIds, notification) => {
  const promises = userIds.map(userId => sendNotificationToUser(userId, notification));
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  console.log(`Sent notifications to ${successful}/${userIds.length} users`);
  
  return successful;
};

// Export helper functions for use in other routes
module.exports = {
  router,
  sendNotificationToUser,
  sendNotificationToUsers
}; 