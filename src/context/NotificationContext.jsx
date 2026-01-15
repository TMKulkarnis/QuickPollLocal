import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { usePolls } from './PollContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = usePolls();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Query: Get notifications for the current user
        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            const notifRef = doc(db, "notifications", notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        const unread = notifications.filter(n => !n.read);

        if (unread.length === 0) return;

        unread.forEach(notif => {
            const ref = doc(db, "notifications", notif.id);
            batch.update(ref, { read: true });
        });

        await batch.commit();
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};
