import { Plus } from 'lucide-react';

export default function ProductivityPanel({ stats, tasks, onCreateTask }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (stats.completionRate / 100) * circumference;

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const highCount = activeTasks.filter((t) => t.priority === 'high').length;
  const mediumCount = activeTasks.filter((t) => t.priority === 'medium').length;
  const lowCount = activeTasks.filter((t) => t.priority === 'low').length;
  const activeTotal = Math.max(activeTasks.length, 1);

  return (
    <aside className="space-y-5">
      <div className="bg-white border border-[#E6E7E0] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#183C32] font-sans">Completion Overview</h2>
        <p className="text-xs text-[#68746D] mt-0.5">Derived directly from your saved tasks.</p>

        <div className="mt-5 flex items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#E6EFE8"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#2F6B52"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold font-mono-num text-[#183C32]">
                {stats.completionRate}%
              </span>
              <span className="text-[11px] text-[#68746D]">Done</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#E6E7E0] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#68746D]">Active High Priority</span>
            <span className="font-mono-num font-semibold text-[#B8523E]">{highCount}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F3F1EA] overflow-hidden">
            <div
              className="h-full bg-[#B8523E] rounded-full"
              style={{ width: `${activeTasks.length ? (highCount / activeTotal) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#68746D]">Active Medium Priority</span>
            <span className="font-mono-num font-semibold text-[#9A5B13]">{mediumCount}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F3F1EA] overflow-hidden">
            <div
              className="h-full bg-[#C78328] rounded-full"
              style={{ width: `${activeTasks.length ? (mediumCount / activeTotal) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#68746D]">Active Low Priority</span>
            <span className="font-mono-num font-semibold text-[#2F6B52]">{lowCount}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F3F1EA] overflow-hidden">
            <div
              className="h-full bg-[#2F6B52] rounded-full"
              style={{ width: `${activeTasks.length ? (lowCount / activeTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#E6EFE8]/70 border border-[#D4E2D8] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#183C32]">Keep your queue clear</h3>
        <p className="mt-1.5 text-xs text-[#4D6358] leading-relaxed">
          Capture new deliverables with clear priorities and optional due dates to keep daily work focused.
        </p>
        <button
          type="button"
          onClick={onCreateTask}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Task
        </button>
      </div>
    </aside>
  );
}
