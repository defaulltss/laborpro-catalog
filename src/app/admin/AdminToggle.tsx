'use client';

interface AdminToggleProps {
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
}

export default function AdminToggle({ enabled, loading, onToggle }: AdminToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:ring-offset-2
                  disabled:cursor-wait disabled:opacity-50
                  ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? 'Visible' : 'Hidden'}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow
                    ring-0 transition duration-200 ease-in-out
                    ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
