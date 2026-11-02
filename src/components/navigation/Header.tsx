import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  title?: string;
  description?: string;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
  onOpenCreateTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  onOpenCommandPalette,
  onOpenMobileMenu,
  onOpenCreateTask,
}) => {
  const { user } = useAuth();
  const { info } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    {
      id: 'notif_1',
      title: 'Task due today',
      description: 'Build the task management API is due at 18:00',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'notif_2',
      title: 'Milestone completed',
      description: 'Implement task retrieval & filters was marked finished',
      time: '3h ago',
      unread: false,
    },
    {
      id: 'notif_3',
      title: 'Daily execution review',
      description: 'Review your personal growth habits this evening',
      time: '5h ago',
      unread: false,
    },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && (
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications, Create Task */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/80 hover:border-slate-300 dark:hover:border-navy-600 text-slate-500 dark:text-slate-400 text-xs transition-all w-28 sm:w-56"
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">Search or jump to...</span>
          <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-700">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-navy-800 p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Notifications
                  </span>
                  <button
                    onClick={() => {
                      info('All notifications marked as read.');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="py-1 divide-y divide-slate-100 dark:divide-navy-800 max-h-72 overflow-y-auto">
                  {mockNotifications.map(n => (
                    <div
                      key={n.id}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-navy-800/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </div>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateTask}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-brand-600/20"
        >
          <span className="hidden sm:inline">Create Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
};
