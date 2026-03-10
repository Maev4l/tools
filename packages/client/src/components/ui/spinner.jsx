import { cn } from '@/lib/utils';

const Spinner = ({ className, size = 'default' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Pulsing ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />

      {/* Spinning ring */}
      <svg
        className="animate-spin-slow"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="text-primary"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Animated checkmark for success state
const CheckmarkSuccess = ({ className }) => (
  <div className={cn('relative animate-bounce-in', className)}>
    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
      <svg
        className="h-6 w-6 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M5 13l4 4L19 7"
          style={{
            strokeDasharray: 100,
            animation: 'check-draw 0.3s ease-out 0.2s forwards',
            strokeDashoffset: 100,
          }}
        />
      </svg>
    </div>
  </div>
);

export { Spinner, CheckmarkSuccess };
