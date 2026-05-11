import { Button } from "@/components/ui/button";
import type { Message } from "@/types";
import { RefreshCw } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  index: number;
  onRetry?: (messageIndex: number) => void;
  isRetrying?: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  index,
  onRetry,
  isRetrying,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex flex-col gap-1 ${
        isUser ? "items-end" : "items-start"
      } animate-fade-in`}
      data-ocid={`jarvis.message.${index + 1}`}
    >
      <div className="flex items-center gap-2">
        {!isUser && (
          <span className="font-mono text-[10px] tracking-[0.15em] text-primary/80 uppercase glow-text-cyan">
            JARVIS
          </span>
        )}
        <span className="font-mono text-[9px] tracking-wider text-muted-foreground/50">
          {formatTime(message.timestamp)}
        </span>
        {isUser && (
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
            You
          </span>
        )}
      </div>

      <div className="flex items-end gap-1 max-w-[80%]">
        {!isUser && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRetry(index)}
            disabled={isRetrying}
            className="h-6 w-6 p-0 shrink-0 mb-1 text-muted-foreground/40 hover:text-primary opacity-0 group-hover:opacity-100 transition-smooth disabled:opacity-50"
            aria-label="Retry this response"
            data-ocid={`jarvis.retry_button.${index + 1}`}
          >
            <RefreshCw
              className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
            />
          </Button>
        )}

        <div
          className={`group relative px-4 py-3 rounded-lg font-body text-sm leading-relaxed break-words min-w-0 ${
            isUser
              ? "bg-secondary/60 text-foreground border border-primary/30 rounded-tr-sm"
              : "glass-blur hud-border text-foreground rounded-tl-sm"
          }`}
          style={{
            boxShadow: isUser
              ? "0 0 12px oklch(0.65 0.18 200 / 0.12), inset 0 0 16px oklch(0.65 0.18 200 / 0.04)"
              : "0 0 16px oklch(0.65 0.18 200 / 0.1), inset 0 1px 0 oklch(0.65 0.18 200 / 0.08)",
          }}
        >
          {!isUser && (
            <div
              className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
              style={{
                background: "oklch(0.65 0.18 200 / 0.6)",
                boxShadow: "0 0 6px oklch(0.65 0.18 200 / 0.8)",
              }}
            />
          )}
          <span className="block pl-1">{message.content}</span>

          {/* Retry loading overlay */}
          {!isUser && isRetrying && (
            <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {!isUser && onRetry && !isRetrying && (
            <button
              type="button"
              onClick={() => onRetry(index)}
              className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-card/80 border border-border/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:border-primary/50 hover:text-primary text-muted-foreground/60"
              aria-label="Retry"
              data-ocid={`jarvis.inline_retry.${index + 1}`}
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
