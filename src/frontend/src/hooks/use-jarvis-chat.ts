import { createActor } from "@/backend";
import type { Message } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PERSONALITY_KEY = "jarvis-personality";

export type Personality = "JARVIS" | "FRIDAY" | "ANALYTICAL";

export interface UseJarvisChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  retryMessage: (messageIndex: number) => Promise<void>;
  stopGeneration: () => void;
  isLoading: boolean;
  isRetrying: boolean;
  retryingIndex: number | null;
  error: string | null;
  personality: Personality;
  setPersonality: (p: Personality) => Promise<void>;
}

export function useJarvisChat(): UseJarvisChatReturn {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
  const [personality, setPersonalityState] = useState<Personality>(() => {
    const stored = localStorage.getItem(PERSONALITY_KEY);
    return (stored as Personality) ?? "JARVIS";
  });
  const abortRef = useRef<AbortController | null>(null);

  const historyQuery = useQuery<Message[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await (
          actor as unknown as {
            getHistory: () => Promise<
              { role: string; content: string; timestamp: bigint }[]
            >;
          }
        ).getHistory();
        return raw.map((m, i) => ({
          id: `${i}-${m.timestamp.toString()}`,
          role: (m.role === "user" ? "user" : "assistant") as Message["role"],
          content: m.content,
          timestamp: Number(m.timestamp),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });

  // Sync personality from backend on mount
  useQuery({
    queryKey: ["personality"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const p = await (
          actor as unknown as { getPersonality: () => Promise<string> }
        ).getPersonality();
        if (p) {
          const valid = p as Personality;
          setPersonalityState(valid);
          localStorage.setItem(PERSONALITY_KEY, valid);
        }
        return p;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const sendMutation = useMutation<string, Error, string>({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not connected");
      abortRef.current = new AbortController();
      const result = await (
        actor as unknown as { sendMessage: (msg: string) => Promise<string> }
      ).sendMessage(content);
      return result;
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const prev = queryClient.getQueryData<Message[]>(["history"]) ?? [];
      const optimistic: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      queryClient.setQueryData<Message[]>(["history"], [...prev, optimistic]);
      return { prev };
    },
    onSuccess: (response: string) => {
      const prev = queryClient.getQueryData<Message[]>(["history"]) ?? [];
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      queryClient.setQueryData<Message[]>(["history"], [...prev, assistantMsg]);
    },
    onError: (_err, _content, context) => {
      if (context && typeof context === "object" && "prev" in context) {
        queryClient.setQueryData(
          ["history"],
          (context as { prev: Message[] }).prev,
        );
      }
    },
  });

  const retryMutation = useMutation<string, Error, number>({
    mutationFn: async (messageIndex: number) => {
      if (!actor) throw new Error("Not connected");
      const result = await (
        actor as unknown as { retryMessage: (idx: number) => Promise<string> }
      ).retryMessage(messageIndex);
      return result;
    },
    onMutate: async (messageIndex: number) => {
      setRetryingIndex(messageIndex);
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const prev = queryClient.getQueryData<Message[]>(["history"]) ?? [];
      return { prev };
    },
    onSuccess: (response: string, messageIndex: number) => {
      const prev = queryClient.getQueryData<Message[]>(["history"]) ?? [];
      // Replace the assistant message at the given index with the new response
      const updated = prev.map((msg, i) =>
        i === messageIndex
          ? { ...msg, content: response, timestamp: Date.now() }
          : msg,
      );
      queryClient.setQueryData<Message[]>(["history"], updated);
      setRetryingIndex(null);
    },
    onError: (_err, _index, context) => {
      if (context && typeof context === "object" && "prev" in context) {
        queryClient.setQueryData(
          ["history"],
          (context as { prev: Message[] }).prev,
        );
      }
      setRetryingIndex(null);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await (
        actor as unknown as { clearHistory: () => Promise<void> }
      ).clearHistory();
    },
    onSuccess: () => {
      queryClient.setQueryData<Message[]>(["history"], []);
    },
  });

  const personalityMutation = useMutation<void, Error, Personality>({
    mutationFn: async (p: Personality) => {
      if (!actor) return;
      await (
        actor as unknown as { setPersonality: (p: string) => Promise<void> }
      ).setPersonality(p);
    },
    onMutate: (p: Personality) => {
      setPersonalityState(p);
      localStorage.setItem(PERSONALITY_KEY, p);
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      await sendMutation.mutateAsync(content);
    },
    [sendMutation],
  );

  const retryMessage = useCallback(
    async (messageIndex: number) => {
      await retryMutation.mutateAsync(messageIndex);
    },
    [retryMutation],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    sendMutation.reset();
    // Revert optimistic user message if no assistant response yet
    const msgs = queryClient.getQueryData<Message[]>(["history"]) ?? [];
    const lastMsg = msgs.at(-1);
    if (lastMsg?.role === "user") {
      queryClient.setQueryData<Message[]>(["history"], msgs.slice(0, -1));
    }
  }, [sendMutation, queryClient]);

  const clearHistory = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const setPersonality = useCallback(
    async (p: Personality) => {
      await personalityMutation.mutateAsync(p);
    },
    [personalityMutation],
  );

  return {
    messages: historyQuery.data ?? [],
    sendMessage,
    clearHistory,
    retryMessage,
    stopGeneration,
    isLoading: sendMutation.isPending,
    isRetrying: retryMutation.isPending,
    retryingIndex,
    error: sendMutation.error?.message ?? null,
    personality,
    setPersonality,
  };
}
