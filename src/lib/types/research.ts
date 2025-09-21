export type Status = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface LogEntry {
  id: string;
  step: number;
  title: string;
  message: string;
  timestamp: string; // ISO
  level?: "info" | "warn" | "error" | "debug";
  meta?: Record<string, unknown>;
}

export interface Article {
  title: string;
  url: string;
  source?: string;
  excerpt?: string;
  keywords?: string[];
}

export interface Result {
  topic: string;
  summary: string;
  topKeywords: string[];
  topArticles: Article[];
}

export interface Task {
  id: string;
  topic: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  logs: LogEntry[];
  result?: Result | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor?: string | null;
}
