import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Task, Priority, TaskStatus } from '../../types';
import { roadmapsService } from '../../services/roadmaps.service';
import { Roadmap } from '../../types';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked', 'cancelled'] as const),
  dueDate: z.string().min(1, 'Please select a due date'),
  dueTime: z.string().optional(),
  roadmapId: z.string().optional(),
  tagsString: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => Promise<void>;
  initialData?: Task | null;
  defaultRoadmapId?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultRoadmapId,
}) => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    roadmapsService.getRoadmaps().then(setRoadmaps);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: todayStr,
      dueTime: '17:00',
      roadmapId: defaultRoadmapId || '',
      tagsString: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        priority: initialData.priority,
        status: initialData.status,
        dueDate: initialData.dueDate,
        dueTime: initialData.dueTime || '',
        roadmapId: initialData.roadmapId || '',
        tagsString: initialData.tags ? initialData.tags.join(', ') : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: todayStr,
        dueTime: '17:00',
        roadmapId: defaultRoadmapId || '',
        tagsString: '',
      });
    }
  }, [initialData, defaultRoadmapId, reset, todayStr, isOpen]);

  const handleFormSubmit = async (formData: TaskFormData) => {
    try {
      setIsSubmitting(true);
      const selectedRoadmap = roadmaps.find(r => r.id === formData.roadmapId);
      const tags = formData.tagsString
        ? formData.tagsString
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : [];

      await onSubmit({
        title: formData.title,
        description: formData.description || '',
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        roadmapId: formData.roadmapId || undefined,
        roadmapTitle: selectedRoadmap ? selectedRoadmap.title : undefined,
        tags,
        milestones: initialData ? initialData.milestones : [],
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
  ];

  const roadmapOptions = [
    { value: '', label: 'None (Standalone Task)' },
    ...roadmaps.map(r => ({ value: r.id, label: r.title })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
      description="Define the goal, set execution priority, and map it to your growth roadmaps."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Task Title *"
          placeholder="e.g. Build the task management API"
          error={errors.title?.message}
          {...register('title')}
          autoFocus
        />

        <Textarea
          label="Execution Description"
          placeholder="Provide context, acceptance criteria, or key constraints..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />

          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date *"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Input
            label="Target Time (Optional)"
            type="time"
            error={errors.dueTime?.message}
            {...register('dueTime')}
          />
        </div>

        <Select
          label="Associate with Roadmap (Optional)"
          options={roadmapOptions}
          error={errors.roadmapId?.message}
          {...register('roadmapId')}
        />

        <Input
          label="Tags (Comma separated)"
          placeholder="e.g. Backend, Express, Database"
          helperText="Separate tags with commas to organize execution streams"
          error={errors.tagsString?.message}
          {...register('tagsString')}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
