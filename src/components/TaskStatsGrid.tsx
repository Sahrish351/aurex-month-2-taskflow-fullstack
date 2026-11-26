import { motion } from 'motion/react';
import type { TaskStats } from '../types';

export default function TaskStatsGrid({
  stats,
  loading,
}: {
  stats: TaskStats;
  loading: boolean;
}) {
  const items = [
    {
      label: 'Total Tasks',
      value: String(stats.total),
      detail: 'All workspace items',
      accent: 'text-[#183C32]',
    },
    {
      label: 'Completed',
      value: String(stats.completed),
      detail: 'Finished deliverables',
      accent: 'text-[#2F6B52]',
    },
    {
      label: 'Pending',
      value: String(stats.active),
      detail: 'Active & in progress',
      accent: 'text-[#183C32]',
    },
    {
      label: 'Overdue',
      value: String(stats.overdue),
      detail: stats.overdue === 0 ? 'All deadlines on track' : 'Needs immediate attention',
      accent: stats.overdue > 0 ? 'text-[#B8523E]' : 'text-[#183C32]',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      detail: 'Overall progress',
      accent: 'text-[#2F6B52]',
    },
  ];

  return (
    <section
      aria-label="Task summary statistics"
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 items-stretch"
    >
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className={`bg-white border border-[#E6E7E0] rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between ${
            idx === 4 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <div>
            <p className="text-xs font-medium text-[#68746D]">{item.label}</p>
            {loading ? (
              <div className="mt-2 h-8 w-16 rounded-md bg-[#F0EEE7] animate-pulse" />
            ) : (
              <p className={`mt-1.5 text-2xl sm:text-3xl font-semibold font-mono-num ${item.accent}`}>
                {item.value}
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-[#68746D] truncate">{item.detail}</p>
        </motion.div>
      ))}
    </section>
  );
}
