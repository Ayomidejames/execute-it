import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Check,
  Clock,
  Tag,
  Map,
  CheckSquare,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Note, Task, Roadmap } from '../../types';
import { tasksService } from '../../services/tasks.service';
import { roadmapsService } from '../../services/roadmaps.service';
import { formatRelativeTime } from '../../lib/utils';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, noteId?: string) => Promise<void>;
  initialNote?: Note | null;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [taskId, setTaskId] = useState('');
  const [roadmapId, setRoadmapId] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    Promise.all([tasksService.getTasks(), roadmapsService.getRoadmaps()]).then(
      ([tList, rList]) => {
        setTasks(tList);
        setRoadmaps(rList);
      }
    );
  }, []);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTagsInput(initialNote.tags ? initialNote.tags.join(', ') : '');
      setTaskId(initialNote.taskId || '');
      setRoadmapId(initialNote.roadmapId || '');
      setLastSavedTime(initialNote.updatedAt);
      setSaveStatus('saved');
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      setTaskId('');
      setRoadmapId('');
      setLastSavedTime('');
      setSaveStatus('saved');
    }
  }, [initialNote, isOpen]);

  // Debounced Autosave (800ms)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!title.trim() && !content.trim()) return;

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const selectedTask = tasks.find(t => t.id === taskId);
        const selectedRoadmap = roadmaps.find(r => r.id === roadmapId);
        const tags = tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        await onSave(
          {
            title: title || 'Untitled Note',
            content,
            tags,
            taskId: taskId || undefined,
            taskTitle: selectedTask?.title,
            roadmapId: roadmapId || undefined,
            roadmapTitle: selectedRoadmap?.title,
          },
          initialNote?.id
        );

        setSaveStatus('saved');
        setLastSavedTime(new Date().toISOString());
      } catch {
        setSaveStatus('unsaved');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content, tagsInput, taskId, roadmapId]);

  const handleManualSave = async () => {
    setSaveStatus('saving');
    const selectedTask = tasks.find(t => t.id === taskId);
    const selectedRoadmap = roadmaps.find(r => r.id === roadmapId);
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    await onSave(
      {
        title: title || 'Untitled Note',
        content,
        tags,
        taskId: taskId || undefined,
        taskTitle: selectedTask?.title,
        roadmapId: roadmapId || undefined,
        roadmapTitle: selectedRoadmap?.title,
      },
      initialNote?.id
    );

    setSaveStatus('saved');
    setLastSavedTime(new Date().toISOString());
    onClose();
  };

  const taskOptions = [
    { value: '', label: 'None (Standalone Note)' },
    ...tasks.map(t => ({ value: t.id, label: t.title })),
  ];

  const roadmapOptions = [
    { value: '', label: 'None' },
    ...roadmaps.map(r => ({ value: r.id, label: r.title })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialNote ? 'Edit Execution Note' : 'Capture Idea or Note'}
      description="Record key concepts, meeting decisions, and implementation strategies."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Autosave Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-brand-600 animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Saving draft...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> All changes saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-amber-600">Unsaved changes</span>
            )}
            {lastSavedTime && saveStatus === 'saved' && (
              <span className="text-slate-400">
                (Last updated {formatRelativeTime(lastSavedTime)})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Back to Editor' : 'Markdown Preview'}</span>
          </button>
        </div>

        {/* Title Field */}
        <div>
          <input
            type="text"
            placeholder="Note title (e.g. PostgreSQL Indexing Best Practices)..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-navy-700 pb-2 focus:border-brand-500 focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
        </div>

        {/* Associations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Associate with Task (Optional)"
            options={taskOptions}
            value={taskId}
            onChange={e => setTaskId(e.target.value)}
          />

          <Select
            label="Associate with Roadmap (Optional)"
            options={roadmapOptions}
            value={roadmapId}
            onChange={e => setRoadmapId(e.target.value)}
          />
        </div>

        {/* Content Area or Preview */}
        {isPreview ? (
          <div className="min-h-[220px] max-h-[350px] overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 prose prose-sm dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300">
              {content || 'Nothing to preview.'}
            </pre>
          </div>
        ) : (
          <textarea
            placeholder="Write notes, markdown code snippets, questions, or architectural decisions..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono leading-relaxed"
          />
        )}

        {/* Tags Field */}
        <Input
          label="Tags (Comma separated)"
          placeholder="e.g. Architecture, Database, Performance"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
        />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
          <span className="text-[11px] text-slate-400">
            Supports Markdown formatting and code blocks
          </span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Done & Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
