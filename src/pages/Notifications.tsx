import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';
import { Notification } from '../types';
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return <AlertTriangle className="text-indigo-500" size={20} />;
      case 'claim': return <MessageSquare className="text-emerald-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Updates on your reports and matches.</p>
        </div>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : notifications.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={cn(
                  "p-4 hover:bg-slate-50 transition-colors",
                  !notification.isRead && "bg-indigo-50/30"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    notification.type === 'match' ? "bg-indigo-100" :
                    notification.type === 'claim' ? "bg-emerald-100" : "bg-blue-100"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={cn(
                        "text-sm font-medium",
                        !notification.isRead ? "text-slate-900 font-bold" : "text-slate-700"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 mb-2">{notification.message}</p>
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View details &rarr;
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-2"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
            <p className="text-slate-500">You don't have any new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
