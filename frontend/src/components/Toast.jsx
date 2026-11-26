import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)]" role="status" aria-live="polite">
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-md bg-white ${
          isError ? 'border-[#E7C2BA] text-[#8F3524]' : 'border-[#CFE0D4] text-[#183C32]'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-[#B8523E] shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#2F6B52] shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <p className="text-sm font-medium flex-1">{toast.text}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-[#68746D] hover:text-[#183C32] p-0.5"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
