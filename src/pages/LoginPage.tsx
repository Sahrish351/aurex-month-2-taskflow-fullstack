import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const REMEMBERED_EMAIL_KEY = 'taskflow_remembered_email';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      try {
        if (rememberMe) {
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
        } else {
          window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // Ignore storage errors
      }
      await login(trimmedEmail, password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reach the server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#F2F6F1] to-[#E6EFE8]/70 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold text-[#183C32]"
          >
            <span className="w-9 h-9 rounded-xl bg-[#2F6B52] text-white inline-flex items-center justify-center shadow-xs">
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
            </span>
            <span>TaskFlow</span>
          </Link>
        </div>

        <main className="bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-9 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#183C32] tracking-tight text-center">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#68746D] text-center">
            Sign in to continue managing your tasks and deadlines.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#68746D] hover:text-[#183C32]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-sm text-[#68746D] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#8E9B93] accent-[#2F6B52]"
                />
                <span>Remember my email</span>
              </label>
            </div>

            {error ? (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#FDF5F3] border border-[#E7C2BA] text-sm text-[#8F3524]"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#68746D]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#2F6B52] hover:text-[#183C32] underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </main>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#68746D] hover:text-[#183C32]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
