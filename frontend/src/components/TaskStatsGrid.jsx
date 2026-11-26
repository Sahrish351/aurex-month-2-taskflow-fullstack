export default function TaskStatsGrid({ stats, loading }) {
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
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4"
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={`bg-white border border-[#E6E7E0] rounded-2xl p-4 sm:p-5 ${
            idx === 4 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <p className="text-xs font-medium text-[#68746D]">{item.label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 rounded-md bg-[#F0EEE7] animate-pulse" />
          ) : (
            <p className={`mt-1.5 text-2xl sm:text-3xl font-semibold font-mono-num ${item.accent}`}>
              {item.value}
            </p>
          )}
          <p className="mt-1.5 text-xs text-[#68746D] truncate">{item.detail}</p>
        </div>
      ))}
    </section>
  );
}
