import { Processor, Queue, Worker } from "bullmq";
import { DriverConfig } from "@app/types/connection";

export abstract class BullWrapper {
  driverConfig: DriverConfig;
  queues: Map<string, Queue> = new Map()
  workers: Map<string, Worker> = new Map()

  constructor(driverConfig: DriverConfig) {
    this.driverConfig = driverConfig;
  }

  createQ(queId: string, name: string) {
    const q = new Queue(name, this.driverConfig)
    console.log('Q --', name);
    this.queues.set(queId, q);
    return q;
  }

  createWorker(workerId: string, name: string, job: Processor<Promise<any>>) {
    const w = new Worker(name, job, this.driverConfig)
    console.log('W --', name);
    this.workers.set(workerId, w);
    return w;
  }

}