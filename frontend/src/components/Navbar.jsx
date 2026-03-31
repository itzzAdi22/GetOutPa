import React, { useState, useEffect } from 'react';
import { getOutpasses } from '../api/localStorageDB';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Sun, Moon, Bell, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await getOutpasses();
        if (user?.role === 'student') {
          const updates = data.filter(op => op.status !== 'pending').slice(0, 5);
          setNotifications(updates);
        } else if (user?.role === 'admin') {
          const pending = data.filter(op => op.status === 'pending').slice(0, 5);
          setNotifications(pending);
        }
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const unreadCount = notifications.length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass border-b border-white/10 z-50 px-6 sm:px-12 flex items-center justify-between">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">GatePass<span className="text-indigo-400">X</span></span>
      </div>

      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-10 h-10 glass rounded-full flex items-center justify-center text-indigo-400 hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-gray-300" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 glass rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-950"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-50 text-slate-800 dark:text-white"
              >
                <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto bg-white/40 dark:bg-black/40 backdrop-blur-md">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif._id} className="p-4 border-b border-black/5 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 transition-colors text-slate-800 dark:text-white">
                        <p className="text-xs font-bold mb-1 opacity-70">Outpass Request</p>
                        <p className="text-sm">
                          {user?.role === 'admin' 
                            ? `Pending request from ${notif.userId?.name || 'Student'} to ${notif.destination}`
                            : `Your outpass to ${notif.destination} has been ${notif.status}`
                          }
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown (Simplified) */}
        <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-1.5 pr-4 rounded-full border border-white/10 transition-all cursor-pointer group">
          <div className="w-9 h-9 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-all">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-sm font-semibold leading-none mb-1">{user?.name}</p>
            <p className="text-indigo-400 text-[10px] uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={logout}
            className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
