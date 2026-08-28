import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import { subscribeToUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserNotifications(currentUser.uid, (data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    setIsOpen(false);

    if (notif.orderId) {
      if (userProfile?.role === 'delivery_partner') {
        navigate(`/delivery/orders/${notif.orderId}`);
      } else {
        navigate(`/customer/orders/${notif.orderId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment':
      case 'delivery':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'order_status':
        return <Package className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-stone-100 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-stone-800 text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(notifications)}
                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50 py-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${
                    notif.read ? 'hover:bg-stone-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white shadow-xs border border-stone-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${notif.read ? 'text-stone-700' : 'text-emerald-950'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-stone-400 flex items-center gap-0.5 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
