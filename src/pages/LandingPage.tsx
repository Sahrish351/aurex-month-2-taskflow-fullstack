import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Flag,
  FolderKanban,
  Lock,
  Menu,
  Search,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PreviewTask {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  completed: boolean;
}

const INITIAL_HERO_TASKS: PreviewTask[] = [
  {
    id: 'h1',
    title: 'Finalize MongoDB task schema & compound owner index',
    priority: 'High',
    due: 'Today',
    completed: true,
  },
  {
    id: 'h2',
    title: 'Review mobile calendar agenda & drawer spacing',
    priority: 'High',
    due: 'Today',
    completed: false,
  },
  {
    id: 'h3',
    title: 'Prepare sprint roadmap & priority breakdown',
    priority: 'Medium',
    due: 'Tomorrow',
    completed: false,
  },
  {
    id: 'h4',
    title: 'Archive completed onboarding checklist',
    priority: 'Low',
    due: 'Nov 30',
    completed: false,
  },
];

const FEATURE_LIST = [
  {
    icon: FolderKanban,
    title: 'Structured Task Views',
    desc: 'Organize tasks with detailed notes across dedicated Overview, My Tasks, Today, and Upcoming views.',
  },
  {
    icon: Flag,
    title: 'Priorities & Due Dates',
    desc: 'Flag High, Medium, or Low priorities, assign target deadlines, and highlight overdue deliverables early.',
  },
  {
    icon: Search,
    title: 'Instant Search & Filters',
    desc: 'Filter instantly by Active, Completed, High Priority, or Overdue status and sort by due date.',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard Analytics',
    desc: 'Track real counts for total, completed, pending, and overdue tasks alongside live completion rates.',
  },
  {
    icon: Calendar,
    title: 'Monthly Calendar',
    desc: 'Inspect scheduled work across a monthly grid and add new tasks directly onto any target date.',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Responsive',
    desc: 'Protected with bcrypt password hashing and JWT user isolation across mobile and desktop screens.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Register in seconds with encrypted password hashing and an isolated personal workspace.',
  },
  {
    num: '02',
    title: 'Add and organize tasks',
    desc: 'Capture tasks with helpful descriptions and group them cleanly across list and board views.',
  },
  {
    num: '03',
    title: 'Set priorities and deadlines',
    desc: 'Assign High, Medium, or Low priority levels and target due dates visible on Today and Calendar.',
  },
  {
    num: '04',
    title: 'Track your progress',
    desc: 'Filter active queues, check off deliverables, and monitor real completion statistics every day.',
  },
];

const BENEFITS = [
  {
    title: 'Stay organized without friction',
    desc: 'Keep daily tasks, upcoming deadlines, and completed work separated cleanly so nothing slips through.',
  },
  {
    title: 'Focus on important work first',
    desc: 'Dedicated Today, High Priority, and Overdue filters surface what deserves attention right now.',
  },
  {
    title: 'Track real measurable progress',
    desc: 'Derived KPI counters and completion rings reflect your saved database records—never vanity numbers.',
  },
  {
    title: 'Calm planning on every screen',
    desc: 'Review approaching dates on the monthly calendar and manage tasks seamlessly on mobile or desktop.',
  },
];

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroTasks, setHeroTasks] = useState<PreviewTask[]>(INITIAL_HERO_TASKS);
  const [heroFilter, setHeroFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showcaseTab, setShowcaseTab] = useState<'overview' | 'today' | 'calendar'>('overview');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  function toggleHeroTask(id: string) {
    setHeroTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  const completedCount = heroTasks.filter((t) => t.completed).length;
  const activeCount = heroTasks.length - completedCount;
  const completionPct = Math.round((completedCount / heroTasks.length) * 100);
  const visibleHeroTasks = heroTasks.filter((t) => {
    if (heroFilter === 'active') return !t.completed;
    if (heroFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <div id="top" className="min-h-screen bg-[#FAF8F3] text-[#183C32] overflow-x-clip">
      {/* Fixed/Sticky Responsive Navigation Bar */}
      <header className="bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E6E7E0] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-[#183C32] whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#2F6B52] text-white inline-flex items-center justify-center">
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </span>
            <span>TaskFlow</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#68746D]" aria-label="Primary">
            <a href="#top" className="hover:text-[#183C32] transition-colors whitespace-nowrap shrink-0">
              Home
            </a>
            <a href="#features" className="hover:text-[#183C32] transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#183C32] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-[#183C32] transition-colors whitespace-nowrap shrink-0">
              Benefits
            </a>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="hover:text-[#183C32] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Dashboard' : 'Login'}
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors whitespace-nowrap shadow-xs shrink-0"
            >
              {user ? 'Open Workspace' : 'Get Started'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-[#183C32] hover:bg-[#EFECE4]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <motion.div
          style={{ scaleX }}
          className="h-[2px] bg-[#2F6B52] origin-left"
          aria-hidden="true"
        />

        {/* Mobile Menu */}
        {mobileMenuOpen ? (
          <div className="lg:hidden bg-white border-t border-[#E6E7E0] px-5 py-4 space-y-2">
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#183C32]"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#183C32]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#183C32]"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#183C32]"
            >
              Benefits
            </a>
            <div className="pt-3 border-t border-[#E6E7E0] flex flex-col gap-2.5">
              <Link
                to={user ? '/dashboard' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-semibold border border-[#E6E7E0] rounded-xl text-[#183C32]"
              >
                {user ? 'Open Dashboard' : 'Login'}
              </Link>
              <Link
                to={user ? '/tasks' : '/register'}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-semibold bg-[#2F6B52] text-white rounded-xl"
              >
                {user ? 'My Tasks' : 'Get Started'}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* Hero Section with Interactive Dashboard Component Preview */}
      <section className="relative bg-gradient-to-b from-[#FAF8F3] via-[#F2F5EF] to-[#FAF8F3] border-b border-[#E6E7E0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: REVEAL_EASE }}
            >
              <p className="text-xs font-semibold tracking-wide text-[#2F6B52]">
                Personal Task &amp; Deadline Workspace
              </p>

              <h1
                className="mt-3 font-display font-semibold tracking-tight text-[#183C32] leading-[1.08] [text-wrap:balance]"
                style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.65rem)' }}
              >
                Bring your tasks, goals and daily work into focus.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#56635C] leading-relaxed max-w-xl">
                Plan your day, organize your priorities and track your progress with one simple
                workspace designed to help you work smarter.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors shadow-sm whitespace-nowrap"
                >
                  <span>{user ? 'Open Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold text-[#183C32] bg-white border border-[#E6E7E0] rounded-xl hover:bg-[#E6EFE8]/50 transition-colors whitespace-nowrap"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-10 pt-7 border-t border-[#E6E7E0] grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <p className="text-xs text-[#68746D]">Views Included</p>
                  <p className="mt-1 text-sm font-semibold text-[#183C32]">Today, Upcoming &amp; Calendar</p>
                </div>
                <div>
                  <p className="text-xs text-[#68746D]">Security</p>
                  <p className="mt-1 text-sm font-semibold text-[#183C32]">bcrypt + JWT Isolation</p>
                </div>
                <div>
                  <p className="text-xs text-[#68746D]">Persistence</p>
                  <p className="mt-1 text-sm font-semibold text-[#183C32]">MongoDB Atlas Ready</p>
                </div>
              </div>
            </motion.div>

            {/* Live Interactive Dashboard Product Preview */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: REVEAL_EASE }}
            >
              <div className="bg-white border border-[#E6E7E0] rounded-2xl shadow-sm overflow-hidden">
                {/* Preview Top Bar */}
                <div className="px-5 py-3.5 bg-[#FAF8F3] border-b border-[#E6E7E0] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#2F6B52] text-white inline-flex items-center justify-center">
                      <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold text-[#183C32]">
                      Interactive Workspace Preview
                    </span>
                  </div>
                  <div className="inline-flex bg-[#EFECE4] p-0.5 rounded-lg gap-0.5" role="tablist">
                    {(['all', 'active', 'completed'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={heroFilter === tab}
                        onClick={() => setHeroFilter(tab)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          heroFilter === tab ? 'bg-white text-[#183C32] shadow-xs' : 'text-[#68746D]'
                        }`}
                      >
                        {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Done'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview KPI Strip */}
                <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 border-b border-[#E6E7E0] bg-white">
                  <div className="rounded-xl bg-[#FAF8F3] border border-[#E6E7E0] p-3">
                    <p className="text-[11px] text-[#68746D]">Active</p>
                    <p className="mt-0.5 text-xl font-semibold font-mono-num text-[#183C32]">
                      {activeCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAF8F3] border border-[#E6E7E0] p-3">
                    <p className="text-[11px] text-[#68746D]">Completed</p>
                    <p className="mt-0.5 text-xl font-semibold font-mono-num text-[#2F6B52]">
                      {completedCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#E6EFE8]/70 border border-[#D4E2D8] p-3">
                    <p className="text-[11px] text-[#4D6358]">Progress</p>
                    <p className="mt-0.5 text-xl font-semibold font-mono-num text-[#183C32]">
                      {completionPct}%
                    </p>
                  </div>
                </div>

                {/* Preview Task Rows */}
                <div className="divide-y divide-[#E6E7E0]">
                  {visibleHeroTasks.length === 0 ? (
                    <div className="py-10 px-6 text-center text-xs text-[#68746D]">
                      No tasks match this filter. Toggle a task or switch tabs above.
                    </div>
                  ) : (
                    visibleHeroTasks.map((task) => (
                      <div
                        key={task.id}
                        className="px-4 sm:px-5 py-3.5 flex items-start gap-3 hover:bg-[#FAF8F3]/70 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleHeroTask(task.id)}
                          aria-pressed={task.completed}
                          aria-label={`Toggle ${task.title}`}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            task.completed
                              ? 'bg-[#2F6B52] border-[#2F6B52] text-white'
                              : 'bg-white border-[#8E9B93] hover:border-[#2F6B52]'
                          }`}
                        >
                          {task.completed ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold leading-snug ${
                              task.completed ? 'line-through text-[#68746D]' : 'text-[#183C32]'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-[#68746D]">
                            <span
                              className={
                                task.priority === 'High'
                                  ? 'text-[#B8523E] font-semibold'
                                  : task.priority === 'Medium'
                                    ? 'text-[#9A5B13] font-semibold'
                                    : 'text-[#2F6B52] font-semibold'
                              }
                            >
                              {task.priority} priority
                            </span>{' '}
                            · <span className="font-mono-num">{task.due}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-5 py-3 bg-[#FAF8F3] border-t border-[#E6E7E0] flex items-center justify-between text-xs text-[#68746D]">
                  <span>Click any checkbox to test live state</span>
                  <Link
                    to={user ? '/dashboard' : '/register'}
                    className="font-semibold text-[#2F6B52] hover:underline"
                  >
                    Create your workspace →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Balanced 6-Card Features Section */}
      <section id="features" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 lg:py-24">
        <motion.div
          className="max-w-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: REVEAL_EASE }}
        >
          <p className="text-xs font-semibold text-[#2F6B52]">Capabilities</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#183C32] tracking-tight [text-wrap:balance]">
            Everything required to plan, prioritize, and finish your work
          </h2>
          <p className="mt-3 text-base text-[#68746D] leading-relaxed">
            TaskFlow combines calm editorial clarity with complete full-stack persistence,
            dedicated planning views, and strict user data isolation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {FEATURE_LIST.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: (idx % 3) * 0.07,
                  ease: REVEAL_EASE,
                }}
                className="bg-white border border-[#E6E7E0] rounded-2xl p-6 sm:p-7 hover:border-[#C5D6CB] transition-colors h-full flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6EFE8] text-[#2F6B52] inline-flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#183C32]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#68746D] leading-relaxed">{feature.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Dashboard Showcase Section */}
      <section className="py-16 lg:py-24 bg-white border-y border-[#E6E7E0]">
        <motion.div
          className="max-w-[1240px] mx-auto px-4 sm:px-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 0.48, ease: REVEAL_EASE }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#2F6B52]">Inside the Dashboard</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#183C32] tracking-tight [text-wrap:balance]">
                Dedicated views for every stage of your week
              </h2>
            </div>

            <div className="inline-flex bg-[#F3F1EA] p-1 rounded-xl gap-1 self-start">
              {[
                { key: 'overview', label: 'Overview Analytics', icon: BarChart3 },
                { key: 'today', label: 'Today Focus', icon: Sun },
                { key: 'calendar', label: 'Monthly Calendar', icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setShowcaseTab(tab.key as 'overview' | 'today' | 'calendar')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      showcaseTab === tab.key
                        ? 'bg-white text-[#183C32] shadow-xs'
                        : 'text-[#68746D] hover:text-[#183C32]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FAF8F3] border border-[#E6E7E0] rounded-2xl p-6 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              {showcaseTab === 'overview' ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: REVEAL_EASE }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xl font-semibold text-[#183C32]">
                      Live KPI summary &amp; priority distribution
                    </h3>
                    <p className="text-sm text-[#68746D] leading-relaxed">
                      Every statistic on the Overview dashboard—Total, Completed, Pending, Overdue,
                      and Completion Rate—is derived directly from your authenticated tasks stored in
                      MongoDB.
                    </p>
                    <ul className="space-y-2 text-sm text-[#183C32]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2F6B52] shrink-0" />
                        <span>Filter by All, Active, Completed, High Priority, or Overdue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2F6B52] shrink-0" />
                        <span>Sort by newest, oldest, due date, or priority tier</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2F6B52] shrink-0" />
                        <span>Edit details or delete with confirmation dialogs</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {[
                      { label: 'Total Tasks', val: '18' },
                      { label: 'Completed', val: '12' },
                      { label: 'Pending', val: '6' },
                      { label: 'Overdue', val: '1' },
                      { label: 'Completion Rate', val: '67%' },
                      { label: 'Due Today', val: '3' },
                    ].map((box) => (
                      <div key={box.label} className="bg-white border border-[#E6E7E0] rounded-xl p-4">
                        <p className="text-xs text-[#68746D]">{box.label}</p>
                        <p className="mt-1 text-2xl font-semibold font-mono-num text-[#183C32]">
                          {box.val}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : showcaseTab === 'today' ? (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: REVEAL_EASE }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xl font-semibold text-[#183C32]">
                      Focused daily queue for Today &amp; Upcoming
                    </h3>
                    <p className="text-sm text-[#68746D] leading-relaxed">
                      Start each morning in Today to tackle overdue tasks, items due today, and
                      unscheduled backlog items—or open Upcoming to inspect deadlines ordered
                      chronologically.
                    </p>
                  </div>
                  <div className="lg:col-span-7 bg-white border border-[#E6E7E0] rounded-xl divide-y divide-[#E6E7E0]">
                    {[
                      { section: 'Overdue', title: 'Submit sprint retrospective notes', tone: 'text-[#B8523E]' },
                      { section: 'Due Today', title: 'Test responsive mobile drawer on 375px viewport', tone: 'text-[#2F6B52]' },
                      { section: 'Upcoming', title: 'Deploy production build & verify health check', tone: 'text-[#68746D]' },
                    ].map((row) => (
                      <div key={row.title} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className={`text-[11px] font-semibold ${row.tone}`}>{row.section}</p>
                          <p className="text-sm font-semibold text-[#183C32] mt-0.5">{row.title}</p>
                        </div>
                        <span className="text-xs text-[#68746D] font-mono-num">Active</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: REVEAL_EASE }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xl font-semibold text-[#183C32]">
                      Interactive Monthly Calendar scheduling
                    </h3>
                    <p className="text-sm text-[#68746D] leading-relaxed">
                      Visualize every task with a due date on an interactive monthly grid—or a clean
                      mobile agenda list. Click any date to inspect scheduled tasks or add a task
                      directly to that day.
                    </p>
                  </div>
                  <div className="lg:col-span-7 bg-white border border-[#E6E7E0] rounded-xl p-4">
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-[#68746D] mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const day = i + 15;
                        const hasTask = day === 18 || day === 22 || day === 26;
                        return (
                          <div
                            key={day}
                            className={`h-12 rounded-lg border p-1.5 text-xs font-mono-num flex flex-col justify-between ${
                              day === 26
                                ? 'bg-[#E6EFE8] border-[#2F6B52] text-[#183C32] font-semibold'
                                : 'bg-[#FAF8F3] border-[#E6E7E0] text-[#68746D]'
                            }`}
                          >
                            <span>{day}</span>
                            {hasTask ? (
                              <span className="block h-1.5 w-full rounded-full bg-[#2F6B52]" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 lg:py-24">
        <motion.div
          className="max-w-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: REVEAL_EASE }}
        >
          <p className="text-xs font-semibold text-[#2F6B52]">How It Works</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#183C32] tracking-tight [text-wrap:balance]">
            From signup to daily clarity in four simple steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: idx * 0.08, ease: REVEAL_EASE }}
              className="bg-white border border-[#E6E7E0] rounded-2xl p-6 h-full flex flex-col"
            >
              <p className="font-mono-num text-sm font-semibold text-[#2F6B52]">{step.num}</p>
              <h3 className="mt-3 text-lg font-semibold text-[#183C32]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#68746D] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section (Clean Symmetrical 2x2 Grid) */}
      <section id="benefits" className="py-16 lg:py-24 bg-[#E6EFE8]/55 border-y border-[#D7E3DB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: REVEAL_EASE }}
            >
              <p className="text-xs font-semibold text-[#2F6B52]">Why TaskFlow</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#183C32] tracking-tight [text-wrap:balance]">
                Designed to help you finish what matters without noise
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#4D6358] leading-relaxed">
                Most task managers either oversimplify into plain sticky notes or overwhelm you
                with enterprise clutter. TaskFlow balances structure, speed, and privacy.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#2F6B52]">
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Private owner-scoped storage on Express &amp; MongoDB</span>
              </div>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {BENEFITS.map((benefit, idx) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: idx * 0.07, ease: REVEAL_EASE }}
                  className="bg-white border border-[#DCE5DF] rounded-2xl p-6 h-full flex flex-col"
                >
                  <h3 className="text-base font-semibold text-[#183C32]">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm text-[#68746D] leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion CTA Section */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.48, ease: REVEAL_EASE }}
          className="bg-[#183C32] text-white rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight [text-wrap:balance]">
              Ready to organize your daily work with confidence?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#CFE0D6] leading-relaxed">
              Create your TaskFlow account in seconds and start tracking priorities, deadlines,
              and progress in one calm workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#FAF8F3] text-[#183C32] rounded-xl hover:bg-[#E6EFE8] transition-colors whitespace-nowrap"
            >
              <span>{user ? 'Open Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold border border-[#497565] text-white rounded-xl hover:bg-[#234E42] transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4 }}
        className="border-t border-[#E6E7E0] bg-white py-12"
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-[#183C32]">
              <span className="w-7 h-7 rounded-lg bg-[#2F6B52] text-white inline-flex items-center justify-center">
                <CheckSquare className="w-4 h-4" aria-hidden="true" />
              </span>
              <span>TaskFlow</span>
            </Link>
            <p className="mt-3 text-sm text-[#68746D] leading-relaxed">
              A focused task management workspace built with React, Express, MongoDB, and JWT
              authentication.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#68746D]">
              Product
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#183C32]">
              <li><a href="#top" className="hover:text-[#2F6B52]">Home</a></li>
              <li><a href="#features" className="hover:text-[#2F6B52]">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#2F6B52]">How It Works</a></li>
              <li><a href="#benefits" className="hover:text-[#2F6B52]">Benefits</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#68746D]">
              Workspace
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#183C32]">
              <li><Link to="/dashboard" className="hover:text-[#2F6B52]">Overview</Link></li>
              <li><Link to="/tasks" className="hover:text-[#2F6B52]">My Tasks</Link></li>
              <li><Link to="/today" className="hover:text-[#2F6B52]">Today</Link></li>
              <li><Link to="/calendar" className="hover:text-[#2F6B52]">Calendar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#68746D]">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#183C32]">
              <li><Link to="/login" className="hover:text-[#2F6B52]">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#2F6B52]">Get Started</Link></li>
              <li><Link to="/settings" className="hover:text-[#2F6B52]">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 mt-10 pt-6 border-t border-[#E6E7E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#68746D]">
          <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          <p>Warm Ivory &amp; Forest Green Productivity Suite</p>
        </div>
      </motion.footer>
    </div>
  );
}
