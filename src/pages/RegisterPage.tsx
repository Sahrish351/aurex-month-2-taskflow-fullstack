import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter to confirm.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await register(trimmedName, trimmedEmail, password);
      navigate('/dashboard', { replace: true });
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[#68746D] text-center">
            Set up your private TaskFlow workspace in seconds.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Full name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ayesha Khan"
                maxLength={60}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="ayesha@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="At least 8 characters"
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
              <p className="mt-1 text-xs text-[#68746D]">
                Use 8 or more characters. Stored hashed with bcrypt.
              </p>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Re-enter your password"
                  className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#68746D] hover:text-[#183C32]"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
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
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#68746D]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#2F6B52] hover:text-[#183C32] underline underline-offset-4"
            >
              Sign in
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
