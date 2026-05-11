import { AudioVisualizer } from "@/components/AudioVisualizer";
import { VoiceButton } from "@/components/VoiceButton";
import { useCallback, useEffect, useRef } from "react";

interface InputDockProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isListening: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  isSpeechSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript: string;
}

export function InputDock({
  value,
  onChange,
  onSend,
  onStop,
  isListening,
  isLoading,
  isProcessing,
  isSpeechSupported,
  onStartListening,
  onStopListening,
  transcript,
}: InputDockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync transcript into input while listening
  useEffect(() => {
    if (transcript) onChange(transcript);
  }, [transcript, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading && value.trim()) onSend();
      }
    },
    [onSend, isLoading, value],
  );

  const handleVoiceToggle = useCallback(() => {
    if (isListening) onStopListening();
    else onStartListening();
  }, [isListening, onStartListening, onStopListening]);

  // Auto-resize textarea
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref mutation only, not reactive state
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [value]);

  const canSend = !isLoading && !isListening && value.trim().length > 0;

  return (
    <div className="shrink-0 px-3 sm:px-5 pb-4 pt-2 border-t hud-border bg-card/60 glass-blur">
      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase animate-pulse">
            Voice Uplink Active
          </span>
        </div>
      )}

      {/* Audio visualizer */}
      <AudioVisualizer isListening={isListening} barCount={28} />

      {/* Stop button when AI is generating */}
      {isLoading && (
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-destructive border border-destructive/40 hover:bg-destructive/10 transition-smooth"
            data-ocid="jarvis.stop_button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            ABORT RESPONSE
          </button>
        </div>
      )}

      {/* Input row */}
      <div
        className="relative flex items-end gap-2 rounded-lg p-2 border transition-smooth"
        style={{
          borderColor: isListening
            ? "oklch(0.65 0.18 200 / 0.85)"
            : value
              ? "oklch(0.65 0.18 200 / 0.5)"
              : "oklch(0.65 0.18 200 / 0.2)",
          boxShadow: isListening
            ? "0 0 20px oklch(0.65 0.18 200 / 0.4), inset 0 0 10px oklch(0.65 0.18 200 / 0.08)"
            : "inset 0 0 6px oklch(0.65 0.18 200 / 0.05)",
        }}
        data-ocid="jarvis.input_dock"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening..."
              : "Type command or initiate voice uplink..."
          }
          rows={1}
          disabled={isListening}
          className="flex-1 resize-none bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/40 outline-none min-h-[36px] max-h-[120px] py-1.5 px-2 leading-relaxed disabled:cursor-default"
          style={{ scrollbarWidth: "none" }}
          data-ocid="jarvis.input"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <VoiceButton
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSpeechSupported}
            onToggle={handleVoiceToggle}
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-smooth disabled:opacity-25 disabled:cursor-not-allowed border border-primary/40 hover:bg-primary/10 hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              boxShadow: canSend
                ? "0 0 12px oklch(0.65 0.18 200 / 0.35), inset 0 0 6px oklch(0.65 0.18 200 / 0.1)"
                : "none",
            }}
            aria-label="Send message"
            data-ocid="jarvis.send_button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              className="w-4 h-4"
              style={{
                stroke: canSend
                  ? "oklch(0.65 0.18 200)"
                  : "oklch(var(--muted-foreground))",
                filter: canSend
                  ? "drop-shadow(0 0 4px oklch(0.65 0.18 200 / 0.7))"
                  : "none",
              }}
              aria-hidden="true"
            >
              <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="m12 5 7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
