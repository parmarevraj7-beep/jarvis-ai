import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Personality } from "@/hooks/use-jarvis-chat";
import type { AppStatus } from "@/types";
import { Settings, Trash2, Volume2, VolumeX, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children?: ReactNode;
  inputDock?: ReactNode;
  appStatus: AppStatus;
  isTtsEnabled: boolean;
  isSpeaking: boolean;
  toggleTts: () => void;
  onClearHistory: () => Promise<void>;
  onOpenSettings: () => void;
  personality: Personality;
}

export function Layout({
  children,
  appStatus,
  isTtsEnabled,
  isSpeaking,
  toggleTts,
  onClearHistory,
  onOpenSettings,
  inputDock,
  personality,
}: LayoutProps) {
  const statusLabel: Record<AppStatus, string> = {
    idle: "STANDBY",
    listening: "LISTENING",
    processing: "PROCESSING",
    error: "ERROR",
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-background relative"
      data-ocid="jarvis.page"
    >
      {/* Scanline overlay */}
      <div
        className="scanline-overlay pointer-events-none"
        aria-hidden="true"
      />

      {/* Top status bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 border-b hud-border bg-card/80 glass-blur shrink-0 z-10"
        data-ocid="jarvis.status_bar"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-primary glow-text-cyan uppercase">
            SYSTEM STATUS: {statusLabel[appStatus]}
          </span>
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground/50 uppercase hidden sm:inline">
            | {personality} MODE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {([8, 11, 14, 17] as const).map((h) => (
              <div
                key={h}
                className="w-0.5 bg-primary rounded-full"
                style={{
                  height: `${h}px`,
                  opacity: appStatus === "idle" ? 0.5 : 1,
                }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            {timeStr}
          </span>
        </div>
      </div>

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b hud-border bg-card/60 glass-blur shrink-0 z-10"
        data-ocid="jarvis.header"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute -top-1 -left-2 w-3 h-3 border-l-2 border-t-2 border-primary opacity-70" />
            <div className="absolute -bottom-1 -left-2 w-3 h-3 border-l-2 border-b-2 border-primary opacity-70" />
            <h1 className="font-display text-base sm:text-xl font-bold tracking-[0.15em] text-foreground">
              <span className="text-primary glow-text-cyan">J.A.R.V.I.S.</span>{" "}
              <span className="hidden sm:inline text-muted-foreground text-sm font-normal tracking-[0.2em]">
                INTELLIGENCE SYSTEM
              </span>
            </h1>
            <div className="absolute -top-1 -right-2 w-3 h-3 border-r-2 border-t-2 border-primary opacity-70" />
            <div className="absolute -bottom-1 -right-2 w-3 h-3 border-r-2 border-b-2 border-primary opacity-70" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-widest border-primary/40 text-primary hidden sm:flex"
            style={{
              boxShadow:
                appStatus !== "idle"
                  ? "0 0 8px oklch(0.65 0.18 200 / 0.6)"
                  : "none",
            }}
            data-ocid="jarvis.status_badge"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                appStatus === "idle"
                  ? "bg-muted-foreground"
                  : appStatus === "error"
                    ? "bg-destructive"
                    : "bg-primary animate-pulse-glow"
              }`}
            />
            {appStatus === "idle" ? "ONLINE" : statusLabel[appStatus]}
          </Badge>

          {isSpeaking && (
            <div className="flex items-center gap-1 px-2">
              {(["bar-a", "bar-b", "bar-c", "bar-d", "bar-e"] as const).map(
                (id, i) => {
                  const heights = [6, 10, 8, 12, 6] as const;
                  return (
                    <div
                      key={id}
                      className="w-0.5 bg-primary rounded-full animate-bounce"
                      style={{
                        height: `${heights[i]}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  );
                },
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTts}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition-smooth"
            style={isTtsEnabled ? { color: "oklch(0.65 0.18 200)" } : {}}
            aria-label={
              isTtsEnabled ? "Disable voice output" : "Enable voice output"
            }
            data-ocid="jarvis.tts_toggle"
          >
            {isTtsEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition-smooth"
            aria-label="Open settings"
            data-ocid="jarvis.settings_button"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-smooth"
            aria-label="Clear conversation"
            data-ocid="jarvis.clear_button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Content area + input dock */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
        {inputDock}
      </div>

      {/* Branding footer */}
      <div className="shrink-0 py-1.5 text-center border-t border-border/30 bg-card/40">
        <p className="font-mono text-[9px] tracking-widest text-muted-foreground/50">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-smooth"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
