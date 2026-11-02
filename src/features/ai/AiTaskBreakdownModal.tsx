import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { aiService } from '../../services/ai.service';
import { AiMilestoneSuggestion, Task, Milestone } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AiTaskBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onApplyMilestones: (milestones: Omit<Milestone, 'id' | 'taskId' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

export const AiTaskBreakdownModal: React.FC<AiTaskBreakdownModalProps> = ({
  isOpen,
  onClose,
  task,
  onApplyMilestones,
}) => {
  const { success, error } = useToast();
  const [contextInput, setContextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [suggestions, setSuggestions] = useState<AiMilestoneSuggestion[]>([]);
  const [rationale, setRationale] = useState('');
  const [isSimulated, setIsSimulated] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const generationSteps = [
    'Analyzing task scope and objectives...',
    'Decomposing requirements into sequential milestones...',
    'Estimating execution complexity and effort...',
    'Synthesizing final execution proposal...',
  ];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerationStep(0);

      // Animate through generation steps
      const interval = setInterval(() => {
        setGenerationStep(prev => (prev < generationSteps.length - 1 ? prev + 1 : prev));
      }, 350);

      const response = await aiService.generateTaskBreakdown({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        context: contextInput,
      });

      clearInterval(interval);
      setSuggestions(response.suggestions);
      setRationale(response.rationale);
      setIsSimulated(response.isSimulated);
    } catch (err: any) {
      error('Failed to generate breakdown. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateDesc = (id: string, newDesc: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, description: newDesc } : s))
    );
  };

  const handleRemove = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddManual = () => {
    const newSug: AiMilestoneSuggestion = {
      id: `sug_${Date.now()}`,
      title: 'New milestone step',
      description: 'Detail the concrete deliverable for this step',
      order: suggestions.length + 1,
      estimatedHours: 2,
      selected: true,
    };
    setSuggestions(prev => [...prev, newSug]);
  };

  const handleApply = async () => {
    const selected = suggestions.filter(s => s.selected);
    if (selected.length === 0) {
      error('Please select at least one milestone to accept.');
      return;
    }

    try {
      setIsApplying(true);
      const converted = selected.map((s, idx) => ({
        title: s.title,
        description: s.description,
        isCompleted: false,
        order: idx + 1,
        estimatedHours: s.estimatedHours,
      }));

      await onApplyMilestones(converted);
      success(`Added ${converted.length} actionable milestones to "${task.title}".`);
      onClose();
    } catch (err) {
      error('Failed to save milestones.');
    } finally {
      setIsApplying(false);
    }
  };

  const selectedCount = suggestions.filter(s => s.selected).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI-Powered Task Breakdown"
      description="Turn complex, overwhelming goals into concrete, actionable execution milestones."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Task Context Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target Task
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Input prompt / guidance */}
        {suggestions.length === 0 && !isGenerating && (
          <div className="space-y-4">
            <Textarea
              label="Additional Context / Constraints (Optional)"
              placeholder="e.g. Focus on automated test coverage, complete within 2 weeks, or emphasize system design..."
              value={contextInput}
              onChange={e => setContextInput(e.target.value)}
              rows={3}
            />

            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>How it works:</strong> ExecuteIt analyzes your goal and recommends a sequenced series of concrete milestones with effort estimates. You can review, edit, or customize the proposal before accepting.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                leftIcon={<Sparkles className="w-4 h-4 text-brand-200" />}
                className="bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20"
              >
                Generate Milestones
              </Button>
            </div>
          </div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-navy-800 flex items-center justify-center text-brand-600">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Decomposing Execution Strategy
              </h4>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1 animate-pulse">
                {generationSteps[generationStep]}
              </p>
            </div>
          </div>
        )}

        {/* Generated Milestones Review & Edit */}
        {suggestions.length > 0 && !isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Proposed Execution Plan ({suggestions.length} steps)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {rationale}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleGenerate}
              >
                Regenerate
              </Button>
            </div>

            {/* Simulated Banner notice */}
            {isSimulated && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Demo Mode:</strong> Generated via mock rule engine. When your Node.js backend is active, this calls <code>POST /api/ai/task-breakdown</code>.
                </span>
              </div>
            )}

            {/* List of proposed milestones */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {suggestions.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    item.selected
                      ? 'bg-white dark:bg-navy-900 border-brand-300 dark:border-brand-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          Step {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => handleUpdateTitle(item.id, e.target.value)}
                          className="w-full text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <textarea
                        value={item.description}
                        onChange={e => handleUpdateDesc(item.id, e.target.value)}
                        rows={2}
                        className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent border-b border-transparent focus:border-brand-500 focus:outline-none resize-none"
                      />
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        {item.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{item.estimatedHours} hours
                          </span>
                        )}
                        {item.suggestedDueDaysFromNow && (
                          <span>Suggested in ~{item.suggestedDueDaysFromNow} days</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add manual milestone button */}
            <button
              onClick={handleAddManual}
              className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-navy-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add custom milestone
            </button>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCount} of {suggestions.length} selected
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isApplying}>
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  isLoading={isApplying}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Accept {selectedCount} Milestones
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
