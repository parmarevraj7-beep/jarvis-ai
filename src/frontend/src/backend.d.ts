import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    content: string;
    role: string;
    timestamp: bigint;
}
export interface backendInterface {
    clearHistory(): Promise<void>;
    getHistory(): Promise<Array<ChatMessage>>;
    getPersonality(): Promise<string>;
    retryMessage(messageIndex: bigint): Promise<string>;
    sendMessage(message: string): Promise<string>;
    setOpenAIKey(key: string): Promise<void>;
    setPersonality(p: string): Promise<void>;
}
