import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Personality } from "@/hooks/use-jarvis-chat";
import type { VoiceSettings } from "@/hooks/use-text-to-speech";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  availableVoices: SpeechSynthesisVoice[];
  personality: Personality;
  onPersonalityChange: (p: Personality) => Promise<void>;
}

const PERSONALITIES: { value: Personality; label: string; desc: string }[] = [
  { value: "JARVIS", label: "JARVIS", desc: "Professional & precise" },
  { value: "FRIDAY", label: "FRIDAY", desc: "Casual & conversational" },
  { value: "ANALYTICAL", label: "ANALYTICAL", desc: "Data-driven & logical" },
];

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentKey,
  voiceSettings,
  onVoiceSettingsChange,
  availableVoices,
  personality,
  onPersonalityChange,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);
  const [saved, setSaved] = useState(false);
  const [localVoice, setLocalVoice] = useState<VoiceSettings>(voiceSettings);
  const [selectedPersonality, setSelectedPersonality] =
    useState<Personality>(personality);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentKey);
      setSaved(false);
      setLocalVoice(voiceSettings);
      setSelectedPersonality(personality);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, currentKey, voiceSettings, personality]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSave() {
    onSave(apiKey.trim());
    onVoiceSettingsChange(localVoice);
    onPersonalityChange(selectedPersonality).catch(() => {});
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }

  function maskKey(key: string) {
    if (key.length < 8) return key;
    return `${key.slice(0, 7)}${"."}.....${key.slice(-4)}`;
  }

  const englishVoices = availableVoices.filter((v) => v.lang.startsWith("en"));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      aria-label="System Settings"
      data-ocid="jarvis.settings.dialog"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close settings backdrop"
      />

      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-lg glass-blur hud-border p-6 space-y-5 max-h-[90vh] overflow-y-auto scroll-area-custom"
        style={{
          boxShadow:
            "0 0 40px oklch(0.65 0.18 200 / 0.2), 0 0 80px oklch(0.65 0.18 200 / 0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold tracking-[0.15em] text-foreground">
              <span className="text-primary glow-text-cyan">SYSTEM</span>{" "}
              <span className="text-muted-foreground">SETTINGS</span>
            </h2>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground/60 mt-0.5">
              CONFIGURATION &amp; PREFERENCES
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-smooth"
            aria-label="Close settings"
            data-ocid="jarvis.settings.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="h-px"
          style={{ background: "oklch(0.65 0.18 200 / 0.2)" }}
        />

        {/* AI Personality */}
        <div className="space-y-2.5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary/80 uppercase glow-text-cyan">
            AI PERSONALITY
          </p>
          <div
            className="grid grid-cols-3 gap-2"
            data-ocid="jarvis.settings.personality_selector"
          >
            {PERSONALITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelectedPersonality(p.value)}
                className="flex flex-col items-center gap-1 p-2.5 rounded border transition-smooth"
                style={{
                  borderColor:
                    selectedPersonality === p.value
                      ? "oklch(0.65 0.18 200 / 0.8)"
                      : "oklch(0.65 0.18 200 / 0.2)",
                  background:
                    selectedPersonality === p.value
                      ? "oklch(0.65 0.18 200 / 0.1)"
                      : "transparent",
                  boxShadow:
                    selectedPersonality === p.value
                      ? "0 0 10px oklch(0.65 0.18 200 / 0.2)"
                      : "none",
                }}
                data-ocid={`jarvis.settings.personality.${p.value.toLowerCase()}`}
              >
                <span
                  className="font-mono text-[10px] tracking-widest font-bold"
                  style={{
                    color:
                      selectedPersonality === p.value
                        ? "oklch(0.65 0.18 200)"
                        : "oklch(var(--muted-foreground))",
                  }}
                >
                  {p.label}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/50 text-center leading-tight">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div
          className="h-px"
          style={{ background: "oklch(0.65 0.18 200 / 0.15)" }}
        />

        {/* Voice Settings */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary/80 uppercase glow-text-cyan">
            VOICE OUTPUT
          </p>

          {/* Voice selection */}
          {englishVoices.length > 0 && (
            <div className="space-y-1.5">
              <Label
                htmlFor="voice-select"
                className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Voice
              </Label>
              <div className="relative">
                <select
                  id="voice-select"
                  value={localVoice.voiceName}
                  onChange={(e) =>
                    setLocalVoice((prev) => ({
                      ...prev,
                      voiceName: e.target.value,
                    }))
                  }
                  className="w-full appearance-none bg-secondary/40 border border-primary/25 focus:border-primary/60 text-foreground font-mono text-xs rounded px-3 py-2 pr-8 outline-none transition-smooth"
                  style={{
                    boxShadow: "inset 0 0 8px oklch(0.65 0.18 200 / 0.06)",
                  }}
                  data-ocid="jarvis.settings.voice_select"
                >
                  <option value="">Auto (Preferred)</option>
                  {englishVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Rate slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="voice-rate"
                className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Rate
              </Label>
              <span className="font-mono text-[10px] text-primary">
                {localVoice.rate.toFixed(2)}x
              </span>
            </div>
            <input
              id="voice-rate"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={localVoice.rate}
              onChange={(e) =>
                setLocalVoice((prev) => ({
                  ...prev,
                  rate: Number(e.target.value),
                }))
              }
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-secondary/60"
              style={{
                accentColor: "oklch(0.65 0.18 200)",
              }}
              data-ocid="jarvis.settings.voice_rate"
            />
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground/40">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="voice-pitch"
                className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Pitch
              </Label>
              <span className="font-mono text-[10px] text-primary">
                {localVoice.pitch.toFixed(2)}
              </span>
            </div>
            <input
              id="voice-pitch"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={localVoice.pitch}
              onChange={(e) =>
                setLocalVoice((prev) => ({
                  ...prev,
                  pitch: Number(e.target.value),
                }))
              }
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-secondary/60"
              style={{
                accentColor: "oklch(0.65 0.18 200)",
              }}
              data-ocid="jarvis.settings.voice_pitch"
            />
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground/40">
              <span>0.5</span>
              <span>2.0</span>
            </div>
          </div>
        </div>

        <div
          className="h-px"
          style={{ background: "oklch(0.65 0.18 200 / 0.15)" }}
        />

        {/* API Key */}
        <div className="space-y-2">
          <Label
            htmlFor="openai-key"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
          >
            OpenAI API Key
          </Label>
          <Input
            ref={inputRef}
            id="openai-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="font-mono text-sm bg-secondary/40 border-primary/25 focus:border-primary/60 text-foreground placeholder:text-muted-foreground/40"
            style={{ boxShadow: "inset 0 0 8px oklch(0.65 0.18 200 / 0.06)" }}
            data-ocid="jarvis.settings.api_key_input"
          />
          {currentKey && (
            <p className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
              Current: {maskKey(currentKey)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted-foreground/40 leading-relaxed">
            Your key is stored locally in the backend canister and used only for
            AI completions.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
            data-ocid="jarvis.settings.cancel_button"
          >
            CANCEL
          </Button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded font-mono text-xs tracking-widest transition-smooth border border-primary/40 hover:bg-primary/10 hover:border-primary/70"
            style={{
              color: saved ? "oklch(0.75 0.15 145)" : "oklch(0.65 0.18 200)",
              boxShadow: saved
                ? "0 0 10px oklch(0.75 0.15 145 / 0.4)"
                : "0 0 10px oklch(0.65 0.18 200 / 0.25)",
            }}
            data-ocid="jarvis.settings.save_button"
          >
            {saved ? "SAVED" : "SAVE CONFIG"}
          </button>
        </div>
      </div>
    </div>
  );
}
