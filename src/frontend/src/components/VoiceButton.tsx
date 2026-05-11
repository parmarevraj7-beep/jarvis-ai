interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

export function VoiceButton({
  isListening,
  isProcessing,
  isSupported,
  onToggle,
}: VoiceButtonProps) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isProcessing}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      data-ocid="jarvis.voice_button"
      className="relative flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        background: isListening
          ? "oklch(0.65 0.18 200 / 0.15)"
          : "oklch(var(--card) / 0.8)",
        border: `1.5px solid oklch(0.65 0.18 200 / ${isListening ? "0.9" : "0.35"})`,
        boxShadow: isListening
          ? "0 0 24px oklch(0.65 0.18 200 / 0.5), 0 0 48px oklch(0.65 0.18 200 / 0.2), inset 0 0 12px oklch(0.65 0.18 200 / 0.1)"
          : "0 0 8px oklch(0.65 0.18 200 / 0.1)",
      }}
    >
      {/* Concentric rings — only when listening */}
      {isListening && (
        <>
          <span
            className="absolute rounded-full border border-primary animate-ring-expand"
            style={{ inset: "-6px" }}
          />
          <span
            className="absolute rounded-full border border-primary animate-ring-expand"
            style={{ inset: "-12px", animationDelay: "0.5s" }}
          />
          <span
            className="absolute rounded-full border border-primary animate-ring-expand"
            style={{ inset: "-18px", animationDelay: "1s" }}
          />
        </>
      )}

      {/* Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.5"
        className="w-5 h-5 relative z-10 transition-smooth"
        style={{
          stroke: isListening
            ? "oklch(0.65 0.18 200)"
            : "oklch(var(--foreground))",
          filter: isListening
            ? "drop-shadow(0 0 4px oklch(0.65 0.18 200 / 0.8))"
            : "none",
        }}
        aria-hidden="true"
      >
        {isListening ? (
          // Stop (square) icon when listening
          <>
            <rect
              x="6"
              y="6"
              width="12"
              height="12"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          // Mic icon when idle
          <>
            <path
              d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
