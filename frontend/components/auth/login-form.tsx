'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/auth-provider';
import { authSchema, type AuthFormValues } from '@/features/auth/schema';

export function LoginForm() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: 'signin',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleModeChange = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    form.reset({
      ...form.getValues(),
      mode: nextMode,
      confirmPassword: '',
    });
  };

  const handleSubmit = async (values: AuthFormValues) => {
    form.clearErrors('root');

    try {
      if (values.mode === 'signup') {
        await signUp(values.email, values.password);
        return;
      }

      await signIn(values.email, values.password);
    } catch {
      form.setError('root', {
        message:
          values.mode === 'signup'
            ? 'Unable to create account with these credentials'
            : 'Invalid email or password',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f7efe8_0%,#f8f3ec_28%,#f6f3ee_48%,#f5f7fb_100%)] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(245,247,251,0.86))] p-8 shadow-[0_24px_44px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-white/75 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Welcome
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === 'signup'
              ? 'Create a new account to access the shared board.'
              : 'Sign in to continue to your collaborative notes board.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-full border border-white/75 bg-white/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
              mode === 'signin'
                ? 'bg-slate-900 text-white shadow-[0_12px_22px_-18px_rgba(15,23,42,0.75)]'
                : 'text-slate-600 hover:bg-white/85'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
              mode === 'signup'
                ? 'bg-slate-900 text-white shadow-[0_12px_22px_-18px_rgba(15,23,42,0.75)]'
                : 'text-slate-600 hover:bg-white/85'
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <input type="hidden" {...form.register('mode')} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register('email')}
              className="mt-1 block w-full rounded-2xl border border-white/70 bg-white/82 px-4 py-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-200"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              {...form.register('password')}
              className="mt-1 block w-full rounded-2xl border border-white/70 bg-white/82 px-4 py-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-200"
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
                className="mt-1 block w-full rounded-2xl border border-white/70 bg-white/82 px-4 py-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-200"
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {form.formState.errors.root?.message && (
            <div className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </div>
          )}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-full border border-slate-900/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_28px_-18px_rgba(15,23,42,0.72)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
          >
            {form.formState.isSubmitting
              ? mode === 'signup'
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'signup'
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
