import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, FileText, Tag, Clock } from 'lucide-react';
import { Note } from '../../types';
import { notesService } from '../../services/notes.service';
import { NoteCard } from './NoteCard';
import { NoteEditorModal } from './NoteEditorModal';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const data = await notesService.getNotes();
      setNotes(data);

      const qNoteId = searchParams.get('noteId');
      if (qNoteId) {
        const found = data.find(n => n.id === qNoteId);
        if (found) {
          setEditingNote(found);
          setIsEditorOpen(true);
        }
      }
    } catch {
      error('Failed to load notes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(n => {
      n.tags?.forEach(t => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (selectedTag !== 'all' && !n.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesTags = n.tags?.some(t => t.toLowerCase().includes(q));
        return matchesTitle || matchesContent || matchesTags;
      }
      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchQuery]);

  const handleSaveNote = async (
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    noteId?: string
  ) => {
    try {
      if (noteId) {
        const updated = await notesService.updateNote(noteId, noteData);
        setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      } else {
        const created = await notesService.createNote(noteData);
        setNotes(prev => [created, ...prev]);
        setEditingNote(created);
        success('Note created!');
      }
    } catch {
      error('Failed to save note.');
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return;
    try {
      await notesService.deleteNote(deletingNoteId);
      setNotes(prev => prev.filter(n => n.id !== deletingNoteId));
      setDeletingNoteId(null);
      success('Note deleted.');
    } catch {
      error('Failed to delete note.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Execution Notes & Knowledge
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture architectural decisions, learning summaries, and insights connected to your work.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingNote(null);
            setIsEditorOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Write Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-subtle">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by title, content, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Tag Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTag === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Notes
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map(n => (
            <Skeleton key={n} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNotes.length === 0 && (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-purple-600" />}
          title={searchQuery ? 'No matching notes found' : 'No notes written yet'}
          description={
            searchQuery
              ? 'Try searching with different keywords or clear the tag filters.'
              : 'Write your first note to capture ideas, meeting takeaways, or study summaries.'
          }
          actionLabel="Write Note"
          onAction={() => {
            setEditingNote(null);
            setIsEditorOpen(true);
          }}
        />
      )}

      {/* Notes Grid */}
      {!isLoading && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={n => {
                setEditingNote(n);
                setIsEditorOpen(true);
              }}
              onDelete={setDeletingNoteId}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <NoteEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
          initialNote={editingNote}
        />
      )}

      {/* Delete Confirmation */}
      {deletingNoteId && (
        <ConfirmModal
          isOpen={Boolean(deletingNoteId)}
          onClose={() => setDeletingNoteId(null)}
          onConfirm={handleDeleteNote}
          title="Delete Note"
          description="Are you sure you want to permanently delete this note? This action cannot be undone."
        />
      )}
    </div>
  );
};
