import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  CalendarCheck,
  RefreshCw,
  ExternalLink,
  Info,
  Check,
} from 'lucide-react';
import { Reminder, Task } from '../../types';
import { remindersService } from '../../services/reminders.service';
import { tasksService } from '../../services/tasks.service';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isDueToday } from '../../lib/utils';

export const RemindersPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error, info } = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [syncGoogle, setSyncGoogle] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Calendar Integration State
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rList, tList] = await Promise.all([
        remindersService.getReminders(),
        tasksService.getTasks(),
      ]);
      setReminders(rList);
      setTasks(tList);
    } catch {
      error('Failed to load reminders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Segregate reminders
  const { todayReminders, upcomingReminders, completedReminders } = useMemo(() => {
    const today: Reminder[] = [];
    const upcoming: Reminder[] = [];
    const completed: Reminder[] = [];

    reminders.forEach(r => {
      if (r.isCompleted) {
        completed.push(r);
      } else if (isDueToday(r.date)) {
        today.push(r);
      } else {
        upcoming.push(r);
      }
    });

    return { todayReminders: today, upcomingReminders: upcoming, completedReminders: completed };
  }, [reminders]);

  const handleToggleComplete = async (id: string) => {
    try {
      const updated = await remindersService.toggleReminderComplete(id);
      setReminders(prev => prev.map(r => (r.id === id ? updated : r)));
      success(updated.isCompleted ? 'Reminder completed!' : 'Reminder reopened');
    } catch {
      error('Failed to update reminder.');
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const matchedTask = tasks.find(t => t.id === selectedTaskId);
      const created = await remindersService.createReminder({
        title,
        description,
        date,
        time,
        isCompleted: false,
        taskId: selectedTaskId || undefined,
        taskTitle: matchedTask?.title,
        syncedWithGoogle: syncGoogle && Boolean(user?.googleCalendarConnected),
      });

      setReminders(prev => [created, ...prev]);
      success('Reminder scheduled successfully!');
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
    } catch {
      error('Failed to create reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async () => {
    if (!deletingReminderId) return;
    try {
      await remindersService.deleteReminder(deletingReminderId);
      setReminders(prev => prev.filter(r => r.id !== deletingReminderId));
      setDeletingReminderId(null);
      success('Reminder deleted.');
    } catch {
      error('Failed to delete reminder.');
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnectingGoogle(true);
      // Simulate backend OAuth token exchange
      await new Promise(r => setTimeout(r, 1200));

      if (user?.googleCalendarConnected) {
        await updateUser({
          googleCalendarConnected: false,
          googleCalendarEmail: undefined,
        });
        success('Google Calendar disconnected.');
      } else {
        await updateUser({
          googleCalendarConnected: true,
          googleCalendarEmail: user?.email || 'alex.johnson@gmail.com',
        });
        success('Google Calendar connected successfully!');
      }
    } catch {
      error('Failed to connect Google Calendar.');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const taskOptions = [
    { value: '', label: 'None (Standalone Reminder)' },
    ...tasks.map(t => ({ value: t.id, label: t.title })),
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reminders & Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep critical milestones and daily execution commitments strictly on track.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Reminder
        </Button>
      </div>

      {/* Google Calendar Integration Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/40 dark:from-navy-900 dark:to-navy-800/80 border border-blue-200/80 dark:border-navy-700 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-navy-700">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google Calendar Integration
              </h3>
              {user?.googleCalendarConnected ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700 dark:bg-navy-700 dark:text-slate-300">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.googleCalendarConnected
                ? `Synchronizing execution reminders with ${user.googleCalendarEmail}`
                : 'Sync task deadlines directly into your Google Calendar account.'}
            </p>
          </div>
        </div>

        <Button
          variant={user?.googleCalendarConnected ? 'outline' : 'primary'}
          size="sm"
          onClick={handleConnectGoogleCalendar}
          isLoading={isConnectingGoogle}
          leftIcon={user?.googleCalendarConnected ? undefined : <Calendar className="w-3.5 h-3.5" />}
        >
          {user?.googleCalendarConnected ? 'Disconnect Account' : 'Connect Google Calendar'}
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && reminders.length === 0 && (
        <EmptyState
          icon={<Bell className="w-6 h-6 text-brand-600" />}
          title="No reminders scheduled"
          description="Create a reminder to keep important deadlines and reflection routines front-and-center."
          actionLabel="Create Reminder"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Reminder Sections */}
      {!isLoading && reminders.length > 0 && (
        <div className="space-y-6">
          {/* Today's Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Due Today</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-[10px] font-bold">
                  {todayReminders.length}
                </span>
              </h3>
            </div>

            {todayReminders.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-navy-800 text-xs text-slate-400 text-center">
                No reminders scheduled for today.
              </div>
            ) : (
              <div className="space-y-2">
                {todayReminders.map(r => (
                  <ReminderItem
                    key={r.id}
                    reminder={r}
                    onToggle={handleToggleComplete}
                    onDelete={setDeletingReminderId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Upcoming</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                {upcomingReminders.length}
              </span>
            </h3>

            {upcomingReminders.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-navy-800 text-xs text-slate-400 text-center">
                No upcoming reminders.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map(r => (
                  <ReminderItem
                    key={r.id}
                    reminder={r}
                    onToggle={handleToggleComplete}
                    onDelete={setDeletingReminderId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div className="space-y-3 opacity-60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span>Completed</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 text-[10px] font-bold">
                  {completedReminders.length}
                </span>
              </h3>

              <div className="space-y-2">
                {completedReminders.map(r => (
                  <ReminderItem
                    key={r.id}
                    reminder={r}
                    onToggle={handleToggleComplete}
                    onDelete={setDeletingReminderId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Reminder"
          description="Schedule a deadline alert with optional Google Calendar synchronization."
          maxWidth="md"
        >
          <form onSubmit={handleCreateReminder} className="space-y-4">
            <Input
              label="Reminder Title *"
              placeholder="e.g. Daily execution review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />

            <Textarea
              label="Details (Optional)"
              placeholder="Add key notes or checklist items..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date *"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />

              <Input
                label="Time *"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>

            <Select
              label="Link to Task (Optional)"
              options={taskOptions}
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
            />

            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={syncGoogle}
                onChange={e => setSyncGoogle(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Sync with Google Calendar</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Reminder
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingReminderId && (
        <ConfirmModal
          isOpen={Boolean(deletingReminderId)}
          onClose={() => setDeletingReminderId(null)}
          onConfirm={handleDeleteReminder}
          title="Delete Reminder"
          description="Are you sure you want to delete this reminder?"
        />
      )}
    </div>
  );
};

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onToggle, onDelete }) => {
  return (
    <div
      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
        reminder.isCompleted
          ? 'bg-slate-50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800'
          : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-subtle'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(reminder.id)}
          className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
        >
          {reminder.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-brand-600" />
          )}
        </button>

        <div>
          <div
            className={`text-sm font-semibold ${
              reminder.isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {reminder.title}
          </div>
          {reminder.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {reminder.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(reminder.date)} at {reminder.time}
            </span>
            {reminder.taskTitle && (
              <span className="text-brand-600 dark:text-brand-400 truncate max-w-[150px]">
                Task: {reminder.taskTitle}
              </span>
            )}
            {reminder.syncedWithGoogle && (
              <span className="text-blue-500 flex items-center gap-0.5">
                • Google Synced
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(reminder.id)}
        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        title="Delete reminder"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
