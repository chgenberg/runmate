// Notification Service for RunMate
import api from './api';

// VAPID public key - you'll need to generate this for production
const VAPID_PUBLIC_KEY = 'BMxWR8EhxXXX...'; // TODO: Replace with actual VAPID key

class NotificationService {
  constructor() {
    this.swRegistration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check if notifications are supported
  isNotificationSupported() {
    return this.isSupported;
  }

  // Initialize service worker and notifications
  async initialize() {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.swRegistration);

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Handle messages from service worker
  handleServiceWorkerMessage = (event) => {
    if (event.data.type === 'NAVIGATE') {
      window.location.pathname = event.data.url;
    }
  };

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) return 'not-supported';

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  // Get current permission status
  getPermissionStatus() {
    if (!this.isSupported) return 'not-supported';
    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) return null;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('Push subscription:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Send subscription to backend
  async sendSubscriptionToServer(subscription) {
    try {
      await api.post('/notifications/subscribe', {
        subscription: subscription.toJSON()
      });
      console.log('Subscription sent to server');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    if (!this.swRegistration) return;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/notifications/unsubscribe');
        console.log('Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  // Show local notification (fallback)
  showLocalNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/logo.png',
      tag: options.tag || 'runmate-local',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification
  async testNotification() {
    const permission = await this.requestPermission();
    if (permission === 'granted') {
      this.showLocalNotification('RunMate Test', {
        body: 'Notifikationer fungerar! 🎉',
        icon: '/logo.png',
        tag: 'test'
      });
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Auto-initialize when imported
notificationService.initialize().catch(console.error);

export default notificationService; 