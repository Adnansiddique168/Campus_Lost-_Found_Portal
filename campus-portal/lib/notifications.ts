export type Notification = {
  id: string;
  roleTarget: 'Admin' | 'User'; // 'Admin' goes to all admins, 'User' goes to specific email.
  userEmailTarget?: string; // Only populate if targeting a specific User
  message: string;
  type: 'NewItem' | 'NewUser' | 'Match' | 'Accepted' | 'NewMessage';
  date: string;
  read: boolean;
  relatedId?: string | number; // To prevent duplicate notifications
};

export function getNotifications(user: any): Notification[] {
  if (typeof window === 'undefined' || !user) return [];
  try {
    const stored = localStorage.getItem('portal_notifications');
    const parsed: Notification[] = stored ? JSON.parse(stored) : [];
    
    // Filter notifications based on role
    return parsed.filter(n => {
      if (user.role === 'Admin' && n.roleTarget === 'Admin') return true;
      if (user.role !== 'Admin' && n.roleTarget === 'User' && n.userEmailTarget === user.email) return true;
      return false;
    }).reverse(); // Newest first
  } catch(e) {
    return [];
  }
}

export function sendNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('portal_notifications');
    const parsed: Notification[] = stored ? JSON.parse(stored) : [];
    
    parsed.push({
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      read: false
    });
    
    localStorage.setItem('portal_notifications', JSON.stringify(parsed));
    
    // Dispatch custom event to trigger live reload in other components
    window.dispatchEvent(new Event('portal_notifications_updated'));
  } catch(e) {
    console.error("Failed to send notification", e);
  }
}

export function markAllAsRead(user: any) {
  if (typeof window === 'undefined' || !user) return;
  try {
    const stored = localStorage.getItem('portal_notifications');
    const parsed: Notification[] = stored ? JSON.parse(stored) : [];
    
    const updated = parsed.map(n => {
      const isTarget = (user.role === 'Admin' && n.roleTarget === 'Admin') || 
                       (user.role !== 'Admin' && n.roleTarget === 'User' && n.userEmailTarget === user.email);
      if (isTarget) {
        return { ...n, read: true };
      }
      return n;
    });
    
    localStorage.setItem('portal_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('portal_notifications_updated'));
  } catch(e) {}
}
