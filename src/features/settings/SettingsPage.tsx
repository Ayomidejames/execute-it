import React, { useState } from 'react';
import {
  User as UserIcon,
  Moon,
  Sun,
  Bell,
  CalendarCheck,
  Shield,
  RotateCcw,
  Check,
  Save,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { mockStorage } from '../../services/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'integrations' | 'security'>('profile');

  // Profile Form
  const [firstName, setFirstName] = useState(user?.firstName || 'Alex');
  const [lastName, setLastName] = useState(user?.lastName || 'Johnson');
  const [email, setEmail] = useState(user?.email || 'alex.johnson@example.com');
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York (UTC-5)');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification Toggles
  const [emailNotifs, setEmailNotifs] = useState(user?.emailNotifications ?? true);
  const [reminderAlerts, setReminderAlerts] = useState(user?.reminderAlerts ?? true);

  // Demo Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await updateUser({
        firstName,
        lastName,
        email,
        bio,
        timezone,
      });
      success('Profile details saved successfully!');
    } catch {
      error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleNotifications = async (type: 'email' | 'reminders') => {
    try {
      if (type === 'email') {
        const next = !emailNotifs;
        setEmailNotifs(next);
        await updateUser({ emailNotifications: next });
      } else {
        const next = !reminderAlerts;
        setReminderAlerts(next);
        await updateUser({ reminderAlerts: next });
      }
      success('Notification preferences updated.');
    } catch {
      error('Failed to update settings.');
    }
  };

  const handleResetDemoData = () => {
    mockStorage.resetToDemo();
    setIsResetModalOpen(false);
    success('Reset demo data to initial sample state.');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, workspace theme, calendar integrations, and notifications.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'appearance', label: 'Appearance' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'integrations', label: 'Integrations' },
          { id: 'security', label: 'Account & Security' },
        ]}
        activeTab={activeTab}
        onChange={id => setActiveTab(id as any)}
      />

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xl flex items-center justify-center border-2 border-brand-200 dark:border-brand-800 shadow-sm">
              {firstName[0]}
              {lastName[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {firstName} {lastName}
              </h3>
              <p className="text-xs text-slate-400">{email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                ExecuteIt Pro Member
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            helperText="Used for system notifications and calendar invitations"
          />

          <Textarea
            label="Personal Philosophy & Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="e.g. Turning intentions into execution across software engineering..."
          />

          <Input
            label="Active Timezone"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            helperText="Ensures reminder alerts and due dates align with your daily schedule"
          />

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button type="submit" variant="primary" isLoading={isSavingProfile} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* Appearance Section */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Workspace Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your interface theme. Light mode is carefully optimized with tailored navy blue accents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50/40 dark:bg-navy-800 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Light Theme (Primary)
                  </span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clean white surfaces with high-contrast navy text and royal blue interactive elements.
              </p>
            </div>

            {/* Dark Mode Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-brand-600 bg-brand-50/40 dark:bg-navy-800 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-brand-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Dark Theme
                  </span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Deep navy blue backgrounds (#0B1120) with slate surfaces and crisp readability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control which execution reminders and summary digests you receive.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-navy-800">
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Email Execution Digests
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Receive a weekly progress summary of completed milestones and upcoming roadmaps.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={() => handleToggleNotifications('email')}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Reminder Alerts
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  In-app notifications when task deadlines and scheduled milestones are due.
                </p>
              </div>
              <input
                type="checkbox"
                checked={reminderAlerts}
                onChange={() => handleToggleNotifications('reminders')}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Integrations Section */}
      {activeTab === 'integrations' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Third-Party Integrations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect external services to streamline your execution workflow.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Calendar Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 flex items-center justify-center text-brand-600 shadow-sm border border-slate-200 dark:border-navy-700">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Google Calendar
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.googleCalendarConnected
                      ? `Connected to ${user.googleCalendarEmail}`
                      : 'Sync tasks and deadlines to Google Calendar.'}
                  </p>
                </div>
              </div>
              <Button
                variant={user?.googleCalendarConnected ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  updateUser({
                    googleCalendarConnected: !user?.googleCalendarConnected,
                    googleCalendarEmail: !user?.googleCalendarConnected
                      ? 'alex.johnson@gmail.com'
                      : undefined,
                  });
                  success(
                    user?.googleCalendarConnected
                      ? 'Disconnected Google Calendar'
                      : 'Connected Google Calendar'
                  );
                }}
              >
                {user?.googleCalendarConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>

            {/* Webhooks / API Keys demo card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800/40 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 dark:border-navy-700">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Express Backend API
                    </h4>
                    <span className="text-[10px] bg-slate-200 dark:bg-navy-700 px-2 py-0.5 rounded font-mono">
                      Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target endpoint: <code>http://localhost:3000/api</code>
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Auto-fallback Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Security & Reset Section */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Account Security & Demo Controls
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage authentication settings and local state persistence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/50 border border-slate-200 dark:border-navy-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Demo Session Architecture
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In accordance with security standards, credentials are never stored in localStorage. When connected to the Express backend, authentication utilizes secure, HttpOnly signed session cookies with CSRF protection.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Reset Demo Data
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore all sample tasks, roadmaps, notes, and reminders to default Alex Johnson state.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Demo Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <ConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetDemoData}
          title="Reset Demo Data"
          description="Are you sure you want to reset all mock tasks, roadmaps, and notes back to the starting sample data?"
          confirmLabel="Reset Everything"
          variant="destructive"
        />
      )}
    </div>
  );
};
