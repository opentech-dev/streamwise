import { Processor, Queue, QueueOptions, RedisConnection, Worker } from "bullmq";
import { DriverConfig } from "@app/types/connection";
import { JobOptions } from "bull";

export abstract class BullWrapper {
  public driverConfig: DriverConfig;
  public queues: Map<string, Queue> = new Map()
  public workers: Map<string, Worker> = new Map()
  private defaultQueOptions: QueueOptions; 

  constructor(driverConfig: DriverConfig, defaultQueueOptions?: QueueOptions) {
    this.driverConfig = driverConfig;
    this.defaultQueOptions = {
      ...defaultQueueOptions,
      ...driverConfig
    }
  }

  createQ(queId: string, name: string, qOptions?: QueueOptions): Queue {
    // configure default options
    // TODO :: include defaultQueOptions support for each component
    const opts =  {...this.defaultQueOptions, ...qOptions};
    
    const q = new Queue(name, opts)
    console.log('Q --', name);
    this.queues.set(queId, q);
    return q;
  }

  createWorker(workerId: string, name: string, job: Processor<Promise<any>>): Worker {
    const w = new Worker(name, job, this.driverConfig)
    console.log('W --', name);
    this.workers.set(workerId, w);
    return w;
  }

}