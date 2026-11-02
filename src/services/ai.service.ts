import { AiMilestoneSuggestion } from '../types';
import { apiClient } from './api';

export interface AiBreakdownRequest {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  context?: string;
}

export interface AiBreakdownResponse {
  suggestions: AiMilestoneSuggestion[];
  isSimulated: boolean;
  modelUsed?: string;
  rationale: string;
}

export const aiService = {
  /**
   * Generates milestones breakdown.
   * Calls POST /api/ai/task-breakdown if backend is connected,
   * otherwise provides high-fidelity simulated AI recommendations.
   */
  async generateTaskBreakdown(req: AiBreakdownRequest): Promise<AiBreakdownResponse> {
    try {
      const res = await apiClient.post<AiBreakdownResponse>('/ai/task-breakdown', req);
      return res.data;
    } catch {
      // Simulate intelligent reasoning delay
      await new Promise(r => setTimeout(r, 1400));

      const titleLower = req.taskTitle.toLowerCase();
      let suggestions: AiMilestoneSuggestion[] = [];
      let rationale = 'Generated a sequenced execution plan decomposing complex deliverables into testable units.';

      if (titleLower.includes('internship') || titleLower.includes('portfolio') || titleLower.includes('resume')) {
        rationale = 'Structured specifically around competitive engineering internship requirements and showcase deliverables.';
        suggestions = [
          {
            id: 'sug_1',
            title: 'Audit and select top 2 flagship repository projects',
            description: 'Ensure clean architecture, working Dockerfiles, setup scripts, and high test coverage.',
            order: 1,
            estimatedHours: 4,
            suggestedDueDaysFromNow: 2,
            selected: true,
          },
          {
            id: 'sug_2',
            title: 'Craft interactive architecture diagrams and live demos',
            description: 'Deploy web demos on Render/Railway and embed system diagrams in GitHub READMEs.',
            order: 2,
            estimatedHours: 5,
            suggestedDueDaysFromNow: 4,
            selected: true,
          },
          {
            id: 'sug_3',
            title: 'Prepare behavioral stories using the STAR method',
            description: 'Outline 5 key engineering stories: technical failure, cross-team conflict, and optimization.',
            order: 3,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 6,
            selected: true,
          },
          {
            id: 'sug_4',
            title: 'Conduct two peer mock technical interviews',
            description: 'Simulate 45-minute live coding with verbal problem breakdown and complexity analysis.',
            order: 4,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 8,
            selected: true,
          },
        ];
      } else if (titleLower.includes('api') || titleLower.includes('backend') || titleLower.includes('node') || titleLower.includes('database')) {
        rationale = 'Created a step-by-step backend lifecycle from schema modeling to integration testing.';
        suggestions = [
          {
            id: 'sug_1',
            title: 'Define domain entities & relational schema constraints',
            description: 'Establish primary keys, foreign key cascading, and database indexes.',
            order: 1,
            estimatedHours: 2,
            suggestedDueDaysFromNow: 1,
            selected: true,
          },
          {
            id: 'sug_2',
            title: 'Implement data transfer objects & Zod validation',
            description: 'Ensure all incoming requests are strictly validated prior to hitting business handlers.',
            order: 2,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 2,
            selected: true,
          },
          {
            id: 'sug_3',
            title: 'Build repository service layer and transaction management',
            description: 'Decouple raw queries from routing logic with atomic transaction rollbacks on failure.',
            order: 3,
            estimatedHours: 4,
            suggestedDueDaysFromNow: 3,
            selected: true,
          },
          {
            id: 'sug_4',
            title: 'Write automated integration test cases with mock DB',
            description: 'Cover edge cases, empty responses, invalid tokens, and rate limit thresholds.',
            order: 4,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 5,
            selected: true,
          },
        ];
      } else if (titleLower.includes('robotics') || titleLower.includes('ros') || titleLower.includes('hardware')) {
        rationale = 'Designed a progressive robotics curriculum starting with simulation before physical deployment.';
        suggestions = [
          {
            id: 'sug_1',
            title: 'Configure ROS 2 workspace and colcon build pipeline',
            description: 'Set up environment overlay, linting, and CMakeLists dependencies.',
            order: 1,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 2,
            selected: true,
          },
          {
            id: 'sug_2',
            title: 'Implement sensor subscriber node with QoS filtering',
            description: 'Parse simulated laser scan range telemetry and filter out noisy outlier points.',
            order: 2,
            estimatedHours: 4,
            suggestedDueDaysFromNow: 4,
            selected: true,
          },
          {
            id: 'sug_3',
            title: 'Test autonomous obstacle avoidance loop in Gazebo',
            description: 'Simulate differential drive robot in a cluttered virtual maze environment.',
            order: 3,
            estimatedHours: 5,
            suggestedDueDaysFromNow: 7,
            selected: true,
          },
        ];
      } else {
        // Generic smart breakdown tailored to any user task
        suggestions = [
          {
            id: 'sug_1',
            title: `Clarify core requirements and constraints for "${req.taskTitle.slice(0, 35)}"`,
            description: 'Define clear definition of done, eliminate ambiguities, and collect essential references.',
            order: 1,
            estimatedHours: 2,
            suggestedDueDaysFromNow: 1,
            selected: true,
          },
          {
            id: 'sug_2',
            title: 'Draft initial execution prototype or working outline',
            description: 'Create the minimum viable version to test fundamental assumptions without friction.',
            order: 2,
            estimatedHours: 4,
            suggestedDueDaysFromNow: 3,
            selected: true,
          },
          {
            id: 'sug_3',
            title: 'Review and refine implementation details',
            description: 'Iterate based on quality checks, edge cases, and self-review.',
            order: 3,
            estimatedHours: 3,
            suggestedDueDaysFromNow: 5,
            selected: true,
          },
          {
            id: 'sug_4',
            title: 'Finalize, document, and verify outcome',
            description: 'Ensure completion criteria are met and document learnings for future roadmaps.',
            order: 4,
            estimatedHours: 2,
            suggestedDueDaysFromNow: 6,
            selected: true,
          },
        ];
      }

      return {
        suggestions,
        isSimulated: true,
        modelUsed: 'ExecuteIt Rule-Engine & Mock AI',
        rationale,
      };
    }
  },
};
