export type ResearchTaskDTO = {
  id: string;
  topic: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  summary?: unknown;
  articles?: Article[];
  keywords?: string[];
};

export type Article = {
  title: string;
  url: string;
  source: string;
  snippet: string;
};

export type ResearchLogDTO = {
  id: string;
  step: number;
  label: string;
  message: string;
  payload?: unknown;
  createdAt: string;
};
