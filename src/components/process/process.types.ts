import { Job } from "bullmq";

export type ProcessEvent = "outbound" | "failed" | "progress";

export type ProcessEventType<T> = {
  failed: (error: Error, job: Job) => void,
  outbound: (data: T) => void,
  progress: (step: string, data: T, progress: number | Object,  job: Job) => void,
}