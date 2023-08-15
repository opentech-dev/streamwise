import { componentId } from "@app/types/component";
import { Job } from "bullmq";

export type ProcessEvent = "outbound" | "failed" | "progress";

export type ProcessEventType<T> = {
  _close: () => void,
  failed: (error: Error, job: Job) => void,
  outbound: (data: T) => void,
  progress: (componentId: componentId, data: T) => void,
}