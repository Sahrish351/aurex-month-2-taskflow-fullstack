import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../services/api';
import type { Task } from '../types';
import { formatShortDate, isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreateTask?: () => void;
  children: ReactNode;
}

export default function DashboardLayout({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  onCreateTask,
  children,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alertTasks, setAlertTasks] = useState<Task[]>([]);
  const [headerSearch, setHeaderSearch] = useState(searchValue ?? '');

  useEffect(() => {
    if (searchValue !== undefined) {
      setHeaderSearch(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    let cancelled = false;
    taskApi
      .list({ status: 'active' })
      .then((data) => {
        if (cancelled) return;
        const dueOrOverdue = data.tasks.filter(
          (t) => isTaskOverdue(t.status, t.dueDate) || isTaskDueToday(t.dueDate)
        );
        setAlertTasks(dueOrOverdue);
      })
      .catch(() => {
        // Notification summary fails silently if offline
      });
    return () => {
      cancelled = true;
    };
  }, [title]);

  const initials = (user?.name || 'TF')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    if (!onSearchChange && headerSearch.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  }

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/tasks', label: 'My Tasks', icon: ListTodo },
    { to: '/today', label: 'Today', icon: Sun },
    { to: '/upcoming', label: 'Upcoming', icon: CalendarClock },
    { to: '/completed', label: 'Completed', icon: CheckCircle2 },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-[#183C32] font-display text-xl font-semibold tracking-tight whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[#2F6B52] text-white inline-flex items-center justify-center">
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
          </span>
          <span>TaskFlow</span>
        </Link>

        <nav className="mt-7 space-y-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#E6EFE8] text-[#183C32]'
                      : 'text-[#68746D] hover:text-[#183C32] hover:bg-[#FAF8F3]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#E6E7E0] space-y-2.5">
        <Link
          to="/settings"
          onClick={() => setMobileNavOpen(false)}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-[#FAF8F3] transition-colors"
        >
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-[#2F6B52] text-white text-xs font-semibold flex items-center justify-center shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#183C32] truncate">{user?.name}</p>
            <p className="text-xs text-[#68746D] truncate">{user?.email}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#68746D] hover:text-[#B8523E] hover:bg-[#FDF5F3] transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] overflow-x-clip">
      {/* Fixed Full-Height Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-40 bg-white border-r border-[#E6E7E0] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#183C32]/35"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-white border-r border-[#E6E7E0] h-full overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-4 p-2 rounded-lg text-[#68746D] hover:bg-[#FAF8F3]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen min-w-0 flex flex-col">
        <header className="bg-white/95 backdrop-blur-sm border-b border-[#E6E7E0] sticky top-0 z-30">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-[#183C32] hover:bg-[#FAF8F3]"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="min-w-0 flex items-center gap-2 text-sm">
                <span className="text-[#68746D] hidden sm:inline">Workspace</span>
                <span className="text-[#68746D] hidden sm:inline">/</span>
                <span className="font-semibold text-[#183C32] truncate">{title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-60">
                <Search
                  className="w-4 h-4 text-[#68746D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={onSearchChange ? searchValue ?? '' : headerSearch}
                  onChange={(e) => {
                    if (onSearchChange) onSearchChange(e.target.value);
                    else setHeaderSearch(e.target.value);
                  }}
                  placeholder="Search tasks..."
                  aria-label="Search workspace tasks"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52]"
                />
              </form>

              {/* Real Overdue & Due Today Notifications Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label={`Due date reminders (${alertTasks.length})`}
                  aria-expanded={notifOpen}
                  className="relative min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-xl border border-[#E6E7E0] bg-[#FAF8F3] text-[#183C32] hover:bg-[#E6EFE8]/60 transition-colors"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {alertTasks.length > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B8523E] text-white text-[10px] font-mono-num font-semibold flex items-center justify-center">
                      {alertTasks.length}
                    </span>
                  ) : null}
                </button>

                {notifOpen ? (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E6E7E0] rounded-2xl shadow-lg p-4 z-50">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E6E7E0]">
                      <p className="text-sm font-semibold text-[#183C32]">Schedule Reminders</p>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-medium text-[#68746D] hover:text-[#183C32]"
                      >
                        Close
                      </button>
                    </div>
                    {alertTasks.length === 0 ? (
                      <p className="py-5 text-center text-xs text-[#68746D]">
                        No tasks due today or overdue. You are all caught up.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-[#E6E7E0] max-h-64 overflow-y-auto">
                        {alertTasks.slice(0, 6).map((item) => {
                          const overdue = isTaskOverdue(item.status, item.dueDate);
                          return (
                            <li key={item.id} className="py-2.5">
                              <Link
                                to="/today"
                                onClick={() => setNotifOpen(false)}
                                className="block hover:bg-[#FAF8F3] rounded-lg p-1 -m-1"
                              >
                                <p className="text-xs font-semibold text-[#183C32] truncate">
                                  {item.title}
                                </p>
                                <p
                                  className={`mt-0.5 text-[11px] font-mono-num ${
                                    overdue ? 'text-[#B8523E]' : 'text-[#2F6B52]'
                                  }`}
                                >
                                  {overdue ? 'Overdue' : 'Due today'} · {formatShortDate(item.dueDate)}
                                </p>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div className="pt-2.5 mt-2 border-t border-[#E6E7E0] flex justify-between text-xs">
                      <Link
                        to="/today"
                        onClick={() => setNotifOpen(false)}
                        className="font-semibold text-[#2F6B52] hover:underline"
                      >
                        Open Today View
                      </Link>
                      <Link
                        to="/calendar"
                        onClick={() => setNotifOpen(false)}
                        className="font-semibold text-[#68746D] hover:text-[#183C32]"
                      >
                        View Calendar
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              {onCreateTask ? (
                <button
                  type="button"
                  onClick={onCreateTask}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>New Task</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#183C32] tracking-tight">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-[#68746D]">{subtitle}</p> : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
