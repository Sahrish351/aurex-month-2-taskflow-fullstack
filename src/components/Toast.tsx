import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

export default function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm max-w-sm ${
        toast.type === 'error'
          ? 'bg-[#FDF5F3] border-[#E7C2BA] text-[#8F3524]'
          : 'bg-[#183C32] border-[#183C32] text-white'
      }`}
    >
      {toast.type === 'error' ? (
        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9FD1B5]" aria-hidden="true" />
      )}
      <span className="flex-1">{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded-md opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-white"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
