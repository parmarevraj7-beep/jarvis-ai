import { EmptyState } from "@/components/EmptyState";
import { InputDock } from "@/components/InputDock";
import { Layout } from "@/components/Layout";
import { MessageBubble } from "@/components/MessageBubble";
import { SettingsModal } from "@/components/SettingsModal";
import { useJarvisChat } from "@/hooks/use-jarvis-chat";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import type { AppStatus } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function ChatPage() {
  const {
    messages,
    sendMessage,
    clearHistory,
    retryMessage,
    stopGeneration,
    isLoading,
    isRetrying,
    retryingIndex,
    error,
    personality,
    setPersonality,
  } = useJarvisChat();
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    clearTranscript,
  } = useSpeechRecognition();
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isEnabled: isTtsEnabled,
    toggleEnabled: toggleTts,
    voiceSettings,
    setVoiceSettings,
    availableVoices,
  } = useTextToSpeech();

  const [appStatus, setAppStatus] = useState<AppStatus>("idle");
  const [inputValue, setInputValue] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive app status
  useEffect(() => {
    if (error) {
      setAppStatus("error");
      return;
    }
    if (isListening) {
      setAppStatus("listening");
      return;
    }
    if (isLoading) {
      setAppStatus("processing");
      return;
    }
    setAppStatus("idle");
  }, [isListening, isLoading, error]);

  // Auto-scroll on new messages
  const messageCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on count
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, isLoading]);

  // Auto-speak latest assistant message
  const lastAssistantContent =
    messages.filter((m) => m.role === "assistant").at(-1)?.content ?? null;
  useEffect(() => {
    if (lastAssistantContent && isTtsEnabled) speak(lastAssistantContent);
  }, [lastAssistantContent, isTtsEnabled, speak]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    clearTranscript();
    stopSpeaking();
    await sendMessage(text);
  }, [inputValue, isLoading, sendMessage, clearTranscript, stopSpeaking]);

  const handleStop = useCallback(() => {
    stopGeneration();
    stopSpeaking();
  }, [stopGeneration, stopSpeaking]);

  const handleRetry = useCallback(
    async (messageIndex: number) => {
      stopSpeaking();
      await retryMessage(messageIndex);
    },
    [retryMessage, stopSpeaking],
  );

  const handlePromptClick = useCallback(
    async (prompt: string) => {
      setInputValue("");
      clearTranscript();
      stopSpeaking();
      await sendMessage(prompt);
    },
    [sendMessage, clearTranscript, stopSpeaking],
  );

  const handleSaveApiKey = useCallback((key: string) => {
    setOpenAIKey(key);
    // In a real integration this would call actor.setOpenAIKey(key)
  }, []);

  const inputDock = (
    <InputDock
      value={inputValue}
      onChange={setInputValue}
      onSend={handleSend}
      onStop={handleStop}
      isListening={isListening}
      isLoading={isLoading}
      isProcessing={isLoading}
      isSpeechSupported={isSpeechSupported}
      onStartListening={startListening}
      onStopListening={stopListening}
      transcript={transcript}
    />
  );

  return (
    <>
      <Layout
        appStatus={appStatus}
        isTtsEnabled={isTtsEnabled}
        isSpeaking={isSpeaking}
        toggleTts={toggleTts}
        onClearHistory={clearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
        inputDock={inputDock}
        personality={personality}
      >
        {/* Chat messages */}
        <main
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-5 scroll-area-custom"
          data-ocid="jarvis.chat_area"
        >
          {messages.length === 0 ? (
            <EmptyState onPromptClick={handlePromptClick} />
          ) : (
            messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={i}
                onRetry={msg.role === "assistant" ? handleRetry : undefined}
                isRetrying={isRetrying && retryingIndex === i}
              />
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div
              className="flex flex-col gap-1 items-start"
              data-ocid="jarvis.loading_state"
            >
              <span className="font-mono text-[10px] tracking-[0.15em] text-primary/80 uppercase px-1 glow-text-cyan">
                JARVIS
              </span>
              <div className="glass-blur hud-border px-4 py-3 rounded-lg flex items-center gap-1.5">
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

          {/* Error state */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded border border-destructive/40 bg-destructive/10 font-mono text-xs text-destructive"
              data-ocid="jarvis.error_state"
            >
              <span>⚠</span> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>
      </Layout>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={openAIKey}
        voiceSettings={voiceSettings}
        onVoiceSettingsChange={setVoiceSettings}
        availableVoices={availableVoices}
        personality={personality}
        onPersonalityChange={setPersonality}
      />
    </>
  );
}
