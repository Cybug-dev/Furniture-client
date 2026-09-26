import { createContext, useContext } from 'react';

export const NotificationsContext = createContext({
  items: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
});

export function useSimulatedNotifications() {
  return useContext(NotificationsContext);
}
