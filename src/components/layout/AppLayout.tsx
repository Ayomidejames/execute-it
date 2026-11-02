import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';
import { MobileNav } from '../navigation/MobileNav';
import { CommandPalette } from '../navigation/CommandPalette';
import { TaskFormModal } from '../../features/tasks/TaskFormModal';
import { RoadmapFormModal } from '../../features/roadmaps/RoadmapFormModal';
import { NoteEditorModal } from '../../features/notes/NoteEditorModal';
import { tasksService } from '../../services/tasks.service';
import { roadmapsService } from '../../services/roadmaps.service';
import { notesService } from '../../services/notes.service';
import { useToast } from '../../context/ToastContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Global modals triggered from header / command palette
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);

  // Derive title from pathname
  const getPageHeaderInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      return {
        title: 'Executive Dashboard',
        description: 'Track daily execution priorities, milestone velocity, and personal growth.',
      };
    }
    if (path.startsWith('/tasks')) {
      return {
        title: 'Task Management',
        description: 'Organize, decompose, and execute your daily deliverables.',
      };
    }
    if (path.startsWith('/roadmaps')) {
      return {
        title: 'Personal Growth Roadmaps',
        description: 'Long-term goals decomposed into sequenced milestone curricula.',
      };
    }
    if (path.startsWith('/notes')) {
      return {
        title: 'Execution Notes & Knowledge',
        description: 'Capture architectural insights, takeaways, and study notes.',
      };
    }
    if (path.startsWith('/reminders')) {
      return {
        title: 'Reminders & Schedule',
        description: 'Never miss a daily reflection or critical deliverable deadline.',
      };
    }
    if (path.startsWith('/progress')) {
      return {
        title: 'Execution Analytics',
        description: 'Objective feedback on your momentum and milestone completion rates.',
      };
    }
    if (path.startsWith('/settings')) {
      return {
        title: 'Settings & Workspace',
        description: 'Configure your profile, theme, calendar sync, and notifications.',
      };
    }
    return { title: 'ExecuteIt', description: 'Turn intentions into execution.' };
  };

  const headerInfo = getPageHeaderInfo();

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksService.createTask(taskData);
      success('Task created!');
      setIsCreateTaskOpen(false);
      // If on tasks page, trigger re-render
      if (location.pathname === '/tasks') {
        window.dispatchEvent(new Event('executeit-data-changed'));
      }
    } catch {
      error('Failed to create task.');
    }
  };

  const handleCreateRoadmap = async (roadmapData: any) => {
    try {
      const created = await roadmapsService.createRoadmap(roadmapData);
      success('Roadmap created!');
      setIsCreateRoadmapOpen(false);
      navigate(`/roadmaps/${created.id}`);
    } catch {
      error('Failed to create roadmap.');
    }
  };

  const handleCreateNote = async (noteData: any) => {
    try {
      await notesService.createNote(noteData);
      success('Note saved!');
      setIsCreateNoteOpen(false);
    } catch {
      error('Failed to save note.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky App Header */}
        <Header
          title={headerInfo.title}
          description={headerInfo.description}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />

        {/* Content Area with smooth scroll and bottom padding for mobile bar */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation (Bottom bar and slide-out drawer) */}
      <MobileNav
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onOpenCreateRoadmap={() => setIsCreateRoadmapOpen(true)}
        onOpenCreateNote={() => setIsCreateNoteOpen(true)}
      />

      {/* Quick Task Creation Modal */}
      {isCreateTaskOpen && (
        <TaskFormModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Quick Roadmap Creation Modal */}
      {isCreateRoadmapOpen && (
        <RoadmapFormModal
          isOpen={isCreateRoadmapOpen}
          onClose={() => setIsCreateRoadmapOpen(false)}
          onSubmit={handleCreateRoadmap}
        />
      )}

      {/* Quick Note Creation Modal */}
      {isCreateNoteOpen && (
        <NoteEditorModal
          isOpen={isCreateNoteOpen}
          onClose={() => setIsCreateNoteOpen(false)}
          onSave={handleCreateNote}
        />
      )}
    </div>
  );
};
