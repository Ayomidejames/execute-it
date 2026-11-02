import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, CheckCircle2, Target, Map, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Top Brand Logo */}
        <div>
          <NavLink to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Execute<span className="text-brand-600">It</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                Turn Intentions Real
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Auth Form */}
        <div className="my-8 sm:my-12">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {subtitle}
            </p>
          </div>
          {children}
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 text-center sm:text-left">
          &copy; {new Date().getFullYear()} ExecuteIt. All rights reserved.
        </div>
      </div>

      {/* Right side: Understated Brand Showcase (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900 via-navy-900 to-navy-950 p-16 flex-col justify-between relative overflow-hidden text-white border-l border-brand-800/40">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-800/60 border border-brand-700/60 text-brand-200">
            Platform Philosophy
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-4 leading-snug">
            "Turn intentions into execution."
          </h2>
          <p className="text-sm text-brand-200/90 mt-2 max-w-md leading-relaxed">
            ExecuteIt moves you past passive list-making. Decompose complex goals with intelligent milestone sequencing, maintain daily execution habits, and measure your real personal growth.
          </p>
        </div>

        {/* Value pillars showcase */}
        <div className="relative z-10 space-y-4 max-w-md my-8">
          <div className="p-4 rounded-xl bg-navy-900/60 border border-brand-800/50 backdrop-blur-sm flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/30 text-brand-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI-Powered Milestones</h4>
              <p className="text-xs text-brand-200/80 mt-0.5">
                Deconstruct overwhelming objectives into clear, bite-sized execution steps.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-brand-800/50 backdrop-blur-sm flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Growth Roadmaps</h4>
              <p className="text-xs text-brand-200/80 mt-0.5">
                Organize learning curricula and long-term career goals into sequenced phases.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-brand-800/50 backdrop-blur-sm flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600/30 text-teal-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Objective Momentum</h4>
              <p className="text-xs text-brand-200/80 mt-0.5">
                Clear analytical metrics showing your execution cadence without vanity noise.
              </p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 text-xs text-brand-300 border-t border-brand-800/60 pt-4">
          Built for high performers, software engineers, and focused self-directed learners.
        </div>
      </div>
    </div>
  );
};
