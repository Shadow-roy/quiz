export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const NOTIFICATIONS_KEY = 'quiz_app_notifications';

const getNotifications = (): Notification[] => {
    try {
        const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
        return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
        console.error("Failed to parse notifications from localStorage", error);
        return [];
    }
};

const saveNotifications = (notifications: Notification[]) => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const notificationService = {
    addNotification: (message: string) => {
        const notifications = getNotifications();
        const newNotification: Notification = {
            id: String(Date.now()),
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        // Keep only the last 20 notifications to prevent storage bloat
        const updatedNotifications = [newNotification, ...notifications].slice(0, 20);
        saveNotifications(updatedNotifications);
        // Dispatch event for same-tab updates
        window.dispatchEvent(new CustomEvent('notifications_updated'));
    },

    getNotifications,

    markAllAsRead: (): Notification[] => {
        let notifications = getNotifications();
        notifications = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(notifications);
        // Dispatch event for same-tab updates
        window.dispatchEvent(new CustomEvent('notifications_updated'));
        return notifications;
    },
};