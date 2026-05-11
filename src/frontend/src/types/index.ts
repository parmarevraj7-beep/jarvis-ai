export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type AppStatus = "idle" | "listening" | "processing" | "error";

export interface AppState {
  status: AppStatus;
}
