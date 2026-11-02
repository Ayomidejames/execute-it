import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, Info } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const signUpSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    agreeTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and privacy policy',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUpPage: React.FC = () => {
  const { signUp } = useAuth();
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
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false as any,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signUp({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      success(`Welcome to ExecuteIt, ${data.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account.');
      error('Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your ExecuteIt account"
      subtitle="Start turning intentions into disciplined, measurable execution today."
    >
      <div className="space-y-4">
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-navy-800 w-full" />
          <span className="bg-white dark:bg-navy-950 px-3 text-xs text-slate-400 uppercase font-medium">
            or with email
          </span>
          <div className="border-t border-slate-200 dark:border-navy-800 w-full" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name *"
              placeholder="Alex"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name *"
              placeholder="Johnson"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email Address *"
            type="email"
            placeholder="alex@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars"
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('password')}
            />

            <Input
              label="Confirm Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('confirmPassword')}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide passwords' : 'Show passwords'}</span>
            </button>
          </div>

          <div>
            <Checkbox
              label={
                <span className="text-xs">
                  I agree to the{' '}
                  <span className="text-brand-600 underline">Terms of Service</span> and{' '}
                  <span className="text-brand-600 underline">Privacy Policy</span>.
                </span>
              }
              {...register('agreeTerms')}
            />
            {errors.agreeTerms && (
              <p className="text-xs text-red-500 mt-1">{errors.agreeTerms.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Create Free Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already have an account?{' '}
          <NavLink
            to="/signin"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Sign in
          </NavLink>
        </div>
      </div>

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
                <strong>OAuth Registration:</strong> Will initiate <code>GET /api/auth/google</code> on your Node.js backend to exchange Google identity profiles and establish a verified session.
              </div>
            </div>
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
