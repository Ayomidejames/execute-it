import React from 'react';
import { FileText, Tag, Clock, Trash2, Edit2, Map, CheckSquare } from 'lucide-react';
import { Note } from '../../types';
import { formatRelativeTime } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => {
  // Strip markdown formatting for preview
  const previewText = note.content
    .replace(/[#*`_~]/g, '')
    .split('\n')
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  return (
    <div
      onClick={() => onClick(note)}
      className="group relative rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 shadow-subtle hover:shadow-card hover:border-slate-300 dark:hover:border-navy-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {note.title}
          </h3>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {previewText || 'No note content yet.'}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-medium"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Association & Timestamp */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-2 truncate max-w-[180px]">
            {note.taskTitle && (
              <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 truncate">
                <CheckSquare className="w-3 h-3 shrink-0" />
                <span className="truncate">{note.taskTitle}</span>
              </span>
            )}
            {note.roadmapTitle && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 truncate">
                <Map className="w-3 h-3 shrink-0" />
                <span className="truncate">{note.roadmapTitle}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
