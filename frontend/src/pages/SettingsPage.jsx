import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogOut } from 'lucide-react';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, authApi } from '../services/api';
import { loadPreferences, savePreferences } from '../utils/preferences';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [prefs, setPrefs] = useState(() => loadPreferences());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleUpdateName(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setToast({ id: Date.now(), type: 'error', text: 'Name must be at least 2 characters.' });
      return;
    }

    setSavingName(true);
    try {
      const data = await authApi.updateProfile({ name: trimmed });
      setUser(data.user);
      setToast({ id: Date.now(), type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setToast({
        id: Date.now(),
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Unable to update profile.',
      });
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (!currentPassword) {
      setToast({ id: Date.now(), type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ id: Date.now(), type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setToast({ id: Date.now(), type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setToast({ id: Date.now(), type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setToast({
        id: Date.now(),
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Unable to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  }

  function updatePreference(key, value) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    savePreferences(updated);
    setToast({ id: Date.now(), type: 'success', text: 'Workspace preference saved.' });
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your profile, password credentials, and workspace preferences."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-[#183C32] font-sans">Account Information</h2>
          <p className="mt-1 text-xs text-[#68746D]">
            Member since <span className="font-mono-num">{joinedDate}</span>
          </p>

          <form onSubmit={handleUpdateName} className="mt-6 space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Full name
              </label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              />
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Email address
              </label>
              <input
                id="settings-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-[#F3F1EA] border border-[#E6E7E0] rounded-xl text-[#68746D] cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={savingName}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors disabled:opacity-60"
            >
              {savingName ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#183C32] font-sans">Security &amp; Password</h2>
              <p className="mt-1 text-xs text-[#68746D]">Your password is hashed using bcrypt before storage.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              aria-label={showPasswords ? 'Hide password fields' : 'Show password fields'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#68746D] hover:text-[#183C32] hover:bg-[#FAF8F3]"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  Show
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="settings-current-pw" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Current password
              </label>
              <input
                id="settings-current-pw"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              />
            </div>

            <div>
              <label htmlFor="settings-new-pw" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                New password
              </label>
              <input
                id="settings-new-pw"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              />
            </div>

            <div>
              <label htmlFor="settings-confirm-pw" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Confirm new password
              </label>
              <input
                id="settings-confirm-pw"
                type={showPasswords ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#183C32] rounded-xl hover:bg-[#102922] transition-colors disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>

        <section className="lg:col-span-7 bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[#183C32] font-sans">Workspace Preferences</h2>
            <p className="mt-1 text-xs text-[#68746D]">
              Customize how Overview and My Tasks display your task lists by default.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pref-view" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Default My Tasks layout
              </label>
              <select
                id="pref-view"
                value={prefs.defaultView}
                onChange={(e) => updatePreference('defaultView', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
              >
                <option value="list">Structured List</option>
                <option value="board">Two-Column Board</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-sort" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Default task sorting
              </label>
              <select
                id="pref-sort"
                value={prefs.defaultSort}
                onChange={(e) => updatePreference('defaultSort', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F3] border border-[#E6E7E0] cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#183C32]">Compact task row density</p>
              <p className="text-xs text-[#68746D]">Show more tasks on screen with tighter vertical padding.</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.compactDensity}
              onChange={(e) => updatePreference('compactDensity', e.target.checked)}
              className="w-4 h-4 rounded border-[#8E9B93] text-[#2F6B52] focus:ring-[#2F6B52]"
            />
          </label>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-[#183C32] font-sans">Session</h2>
          <p className="mt-1 text-xs text-[#68746D] leading-relaxed">
            Your workspace is authenticated via an HttpOnly JWT session cookie and scoped strictly to your account.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#B8523E] bg-[#FDF5F3] border border-[#E8C8BF] rounded-xl hover:bg-[#FCEAE5] transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Log Out
          </button>
        </section>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardLayout>
  );
}
