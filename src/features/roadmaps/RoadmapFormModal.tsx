import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Roadmap } from '../../types';

const roadmapSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Please provide a short description of the roadmap'),
  category: z.enum(['Career', 'Technical', 'Personal', 'Health', 'Education', 'Projects'] as const),
  startDate: z.string().min(1, 'Please select a start date'),
  targetDate: z.string().min(1, 'Please select a target completion date'),
  color: z.string(),
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

interface RoadmapFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Roadmap | null;
}

export const RoadmapFormModal: React.FC<RoadmapFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'Career',
      startDate: initialData?.startDate || todayStr,
      targetDate: initialData?.targetDate || '',
      color: initialData?.color || '#2563EB',
    },
  });

  const selectedColor = watch('color');

  const colorPalette = [
    { name: 'Royal Blue', value: '#2563EB' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  const handleFormSubmit = async (formData: RoadmapFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: initialData ? initialData.status : 'active',
        startDate: formData.startDate,
        targetDate: formData.targetDate,
        color: formData.color,
        stages: initialData ? initialData.stages : [
          {
            id: `stg_${Date.now()}_1`,
            title: 'Phase 1: Foundations & Planning',
            description: 'Core concepts and setup execution',
            order: 1,
            taskIds: [],
          },
          {
            id: `stg_${Date.now()}_2`,
            title: 'Phase 2: Execution & Implementation',
            description: 'Building key deliverables and milestones',
            order: 2,
            taskIds: [],
          },
        ],
        taskIds: initialData ? initialData.taskIds : [],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'Career', label: 'Career Growth' },
    { value: 'Technical', label: 'Technical Mastery' },
    { value: 'Personal', label: 'Personal Growth' },
    { value: 'Health', label: 'Health & Fitness' },
    { value: 'Education', label: 'Education & Study' },
    { value: 'Projects', label: 'Special Projects' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Growth Roadmap' : 'Create Personal Growth Roadmap'}
      description="Organize long-term ambitions into structured execution phases."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Roadmap Title *"
          placeholder="e.g. Backend Developer Roadmap"
          error={errors.title?.message}
          {...register('title')}
          autoFocus
        />

        <Textarea
          label="Vision & Description *"
          placeholder="Describe your long-term goal and why achieving it matters..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <Select
          label="Category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          <Input
            label="Target Date *"
            type="date"
            error={errors.targetDate?.message}
            {...register('targetDate')}
          />
        </div>

        {/* Accent Color picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Accent Theme Color
          </label>
          <div className="flex items-center gap-3">
            {colorPalette.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setValue('color', c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  selectedColor === c.value ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Roadmap' : 'Create Roadmap'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
