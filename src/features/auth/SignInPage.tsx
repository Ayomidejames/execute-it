import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: 'alex.johnson@example.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signIn(data);
      success('Welcome back, Alex!');
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password.');
      error('Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to ExecuteIt"
      subtitle="Welcome back. Enter your credentials to access your execution workspace."
    >
      <div className="space-y-5">
        {/* Error notification banner if any */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{authError}</span>
          </div>
        )}

        {/* Google OAuth Trigger */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-navy-800 w-full" />
          <span className="bg-white dark:bg-navy-950 px-3 text-xs text-slate-400 uppercase font-medium">
            or with email
          </span>
          <div className="border-t border-slate-200 dark:border-navy-800 w-full" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="alex.johnson@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Checkbox
              label="Remember me for 30 days"
              {...register('rememberMe')}
            />
            <NavLink
              to="/forgot-password"
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Forgot password?
            </NavLink>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign in to Workspace
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Don't have an account yet?{' '}
          <NavLink
            to="/signup"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Create an account
          </NavLink>
        </div>
      </div>

      {/* Google OAuth Architecture Explanation Modal */}
      {showGoogleModal && (
        <Modal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
          title="Google OAuth Integration Boundary"
          description="Documentation of frontend integration flow for Express and Node.js backend."
          maxWidth="md"
        >
          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Honest Integration Point:</strong> No mock Google token is accepted as real OAuth. In production, this button redirects to:
                <code className="block mt-1 p-1 bg-white dark:bg-navy-900 rounded font-mono">
                  GET /api/auth/google
                </code>
              </div>
            </div>

            <p>
              The Node.js Express backend negotiates the Google OAuth 2.0 authorization code with Google identity servers, provisions or retrieves the user record in PostgreSQL, and returns an HttpOnly session cookie before redirecting back to:
              <code className="block mt-1 p-1 bg-slate-100 dark:bg-navy-800 rounded font-mono">
                /auth/callback?status=success
              </code>
            </p>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setShowGoogleModal(false)}>
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AuthLayout>
  );
};
