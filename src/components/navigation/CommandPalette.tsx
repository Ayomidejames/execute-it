import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckSquare,
  Map,
  FileText,
  Plus,
  ArrowRight,
  Bell,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { mockStorage } from '../../services/storage';
import { Task, Roadmap, Note } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTask?: () => void;
  onOpenCreateRoadmap?: () => void;
  onOpenCreateNote?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateTask,
  onOpenCreateRoadmap,
  onOpenCreateNote,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTasks(mockStorage.getTasks());
      setRoadmaps(mockStorage.getRoadmaps());
      setNotes(mockStorage.getNotes());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTasks = tasks.filter(
    t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
  );

  const filteredRoadmaps = roadmaps.filter(
    r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  );

  const filteredNotes = notes.filter(
    n => n.title.toLowerCase().includes(q) || n.tags.some(tag => tag.toLowerCase().includes(q))
  );

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
    >
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-800 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-navy-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search tasks, roadmaps, notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-navy-800 rounded border border-slate-200 dark:border-navy-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {(!q || 'create new task roadmap note'.includes(q)) && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Quick Actions
              </div>
              <div className="space-y-1">
                {onOpenCreateTask && (
                  <button
                    onClick={() => handleSelect(onOpenCreateTask)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Create New Task</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
                {onOpenCreateRoadmap && (
                  <button
                    onClick={() => handleSelect(onOpenCreateRoadmap)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Create New Roadmap</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
                {onOpenCreateNote && (
                  <button
                    onClick={() => handleSelect(onOpenCreateNote)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Write New Note</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation destinations */}
          {!q && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Go To
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                {[
                  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
                  { label: 'Roadmaps', to: '/roadmaps', icon: Map },
                  { label: 'Notes', to: '/notes', icon: FileText },
                  { label: 'Reminders', to: '/reminders', icon: Bell },
                  { label: 'Progress Analytics', to: '/progress', icon: BarChart3 },
                  { label: 'Settings', to: '/settings', icon: Settings },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => handleSelect(() => navigate(item.to))}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-left transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                <span>Tasks ({filteredTasks.length})</span>
                <span className="text-[10px] lowercase font-normal">Press enter to view</span>
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleSelect(() => navigate(`/tasks?taskId=${task.id}`))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <CheckSquare className="w-4 h-4 text-brand-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Priority: {task.priority}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Roadmaps */}
          {filteredRoadmaps.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Roadmaps ({filteredRoadmaps.length})
              </div>
              <div className="space-y-1">
                {filteredRoadmaps.map(roadmap => (
                  <button
                    key={roadmap.id}
                    onClick={() => handleSelect(() => navigate(`/roadmaps/${roadmap.id}`))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Map className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {roadmap.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {roadmap.category} • Target: {roadmap.targetDate}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Notes ({filteredNotes.length})
              </div>
              <div className="space-y-1">
                {filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => handleSelect(() => navigate(`/notes?noteId=${note.id}`))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {note.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {note.tags.join(', ')}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {q && filteredTasks.length === 0 && filteredRoadmaps.length === 0 && filteredNotes.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching tasks, roadmaps, or notes found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Search anything in ExecuteIt</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
