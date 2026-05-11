interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Analyze current system status and report anomalies",
  "What are the latest developments in quantum computing?",
  "Draft a tactical briefing for the next mission",
  "Calculate optimal energy output for the arc reactor",
];

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-8 text-center px-4 py-12"
      data-ocid="jarvis.empty_state"
    >
      {/* Animated arc reactor / logo */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer pulse rings */}
        <div
          className="absolute inset-0 rounded-full border border-primary/20 animate-ring-expand"
          style={{ animationDuration: "2.5s" }}
        />
        <div
          className="absolute inset-0 rounded-full border border-primary/30 animate-ring-expand"
          style={{ animationDuration: "2.5s", animationDelay: "0.8s" }}
        />
        <div
          className="absolute inset-0 rounded-full border border-primary/20 animate-ring-expand"
          style={{ animationDuration: "2.5s", animationDelay: "1.6s" }}
        />
        {/* Static rings */}
        <div
          className="absolute inset-4 rounded-full border border-primary/40"
          style={{ boxShadow: "0 0 12px oklch(0.65 0.18 200 / 0.3)" }}
        />
        <div
          className="absolute inset-7 rounded-full border-2 border-primary"
          style={{
            boxShadow:
              "0 0 20px oklch(0.65 0.18 200 / 0.6), inset 0 0 10px oklch(0.65 0.18 200 / 0.2)",
          }}
        />
        {/* Center hexagon */}
        <div
          className="absolute inset-10 rounded-full animate-pulse-glow"
          style={{
            background: "oklch(0.65 0.18 200 / 0.3)",
            boxShadow: "0 0 16px oklch(0.65 0.18 200 / 0.8)",
          }}
        />
        {/* Triangles ornament */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 relative z-10"
          fill="oklch(0.65 0.18 200)"
          aria-hidden="true"
        >
          <polygon points="12,4 20,19 4,19" opacity="0.9" />
          <polygon points="12,20 4,5 20,5" opacity="0.4" />
        </svg>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2
          className="font-display text-3xl sm:text-4xl font-bold tracking-[0.25em] text-primary glow-text-cyan"
          data-ocid="jarvis.logo_text"
        >
          J.A.R.V.I.S.
        </h2>
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Just A Rather Very Intelligent System
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="h-px w-12 bg-primary/30" />
          <span className="font-mono text-[9px] tracking-[0.4em] text-primary/50">
            SYSTEM ONLINE
          </span>
          <div className="h-px w-12 bg-primary/30" />
        </div>
      </div>

      {/* Example prompts */}
      <div className="w-full max-w-lg space-y-2">
        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase mb-3">
          Suggested Commands
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptClick(prompt)}
              className="text-left px-4 py-3 rounded-lg text-xs font-body text-muted-foreground hover:text-primary transition-smooth hud-border glass-blur hover:glow-border-cyan group"
              style={{
                background: "oklch(var(--card) / 0.4)",
              }}
              data-ocid={`jarvis.prompt_chip.${i + 1}`}
            >
              <span className="font-mono text-primary/60 mr-2 group-hover:text-primary transition-smooth">
                &gt;
              </span>
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
