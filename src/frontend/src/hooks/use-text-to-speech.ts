import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isEnabled: boolean;
  toggleEnabled: () => void;
}

const STORAGE_KEY = "jarvis-voice-settings";

export interface VoiceSettings {
  rate: number;
  pitch: number;
  voiceName: string;
}

function loadVoiceSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw)
      return { rate: 0.95, pitch: 0.85, voiceName: "", ...JSON.parse(raw) };
  } catch {}
  return { rate: 0.95, pitch: 0.85, voiceName: "" };
}

export interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isEnabled: boolean;
  toggleEnabled: () => void;
  voiceSettings: VoiceSettings;
  setVoiceSettings: (settings: VoiceSettings) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [voiceSettings, setVoiceSettingsState] =
    useState<VoiceSettings>(loadVoiceSettings);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices (they load asynchronously in some browsers)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const setVoiceSettings = useCallback((settings: VoiceSettings) => {
    setVoiceSettingsState(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (
        !isEnabled ||
        typeof window === "undefined" ||
        !window.speechSynthesis
      )
        return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voiceSettings.voiceName) {
        const selected = voices.find((v) => v.name === voiceSettings.voiceName);
        if (selected) utterance.voice = selected;
      } else {
        // Prefer a male voice for Jarvis effect
        const preferredVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes("daniel") ||
            v.name.toLowerCase().includes("alex") ||
            v.name.toLowerCase().includes("david") ||
            (v.lang === "en-US" && !v.name.toLowerCase().includes("female")),
        );
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isEnabled, voiceSettings],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isEnabled,
    toggleEnabled,
    voiceSettings,
    setVoiceSettings,
    availableVoices,
  };
}
