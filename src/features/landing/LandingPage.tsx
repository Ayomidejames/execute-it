import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  Map,
  BarChart3,
  FileText,
  Bell,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Execute<span className="text-brand-600">It</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                Turn Intentions Real
              </span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How it Works
            </a>
            <a href="#philosophy" className="hover:text-brand-600 transition-colors">
              Philosophy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/signin"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 px-3 py-1.5 transition-colors"
            >
              Sign In
            </NavLink>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Enter Workspace
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turn Intentions Into Execution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Turn your goals into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              meaningful progress.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ExecuteIt helps you organize tasks, break complex goals into actionable milestones with AI, and track your growth — all in one focused workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-lg shadow-brand-600/25"
            >
              Get started free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Explore live demo
            </Button>
          </div>

          {/* Interactive UI Preview Showcase */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4 sm:p-6 shadow-2xl shadow-slate-900/10 text-left space-y-4">
              {/* Fake App Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">
                    ExecuteIt — Today's Focus
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  65% Completed
                </span>
              </div>

              {/* Sample Task Row */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-brand-200 dark:border-brand-900/80 bg-brand-50/30 dark:bg-brand-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Build the task management API
                      </div>
                      <div className="text-xs text-slate-400">
                        3 of 5 actionable milestones finished • Backend Developer Roadmap
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200">
                    High Priority
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-navy-700" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Study PostgreSQL relationships and indexing
                      </div>
                      <div className="text-xs text-slate-400">
                        1 of 2 milestones completed • Target 20:00
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                    Medium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-navy-900 border-y border-slate-200 dark:border-navy-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Engineered For High Performers
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything required to move from planning to execution.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                1. Smart Task Management
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Organize tasks, priorities, and deadlines across responsive list and board views.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                2. AI-Powered Breakdown
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Turn overwhelming, ambiguous tasks into manageable, actionable milestones with effort estimates.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                3. Personal Growth Roadmaps
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Structure long-term career aspirations and technical curricula into sequenced phases.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                4. Objective Progress Tracking
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Understand what you have completed and what needs attention with clean Recharts visuals.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                5. Notes & Knowledge Capture
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep useful markdown notes, code snippets, and architectural decisions directly tied to your tasks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                6. Reminders & Calendar Sync
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep important deadlines visible with Google Calendar integration readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              The Execution Framework
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three steps from intention to outcome.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-navy-800 text-brand-600 font-extrabold text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Define Your Goal
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clarify your objective, set realistic deadlines, and map it to a broader roadmap.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-navy-800 text-brand-600 font-extrabold text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Break Into Milestones
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Use AI or manual breakdown to transform huge projects into concrete, testable deliverables.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-navy-800 text-brand-600 font-extrabold text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Execute & Review
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Check off items daily, capture knowledge notes, and review your analytical growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Your next step starts here.
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Bring your plans together and make progress one task at a time.
          </p>
          <div className="pt-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/signup')}
              rightIcon={<ArrowRight className="w-4 h-4 text-brand-600" />}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xl"
            >
              Start with ExecuteIt
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">ExecuteIt</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="hover:text-brand-600">
              Workspace
            </NavLink>
            <NavLink to="/signin" className="hover:text-brand-600">
              Sign In
            </NavLink>
            <NavLink to="/signup" className="hover:text-brand-600">
              Sign Up
            </NavLink>
            <a href="#features" className="hover:text-brand-600">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
