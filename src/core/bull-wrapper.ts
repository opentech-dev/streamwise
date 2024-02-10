import { Processor, Queue, QueueOptions, RedisConnection, Worker } from "bullmq";
import { DriverConfig } from "@app/types/connection";
import { JobOptions } from "bull";

export abstract class BullWrapper {
  public driverConfig: DriverConfig;
  public queues: Map<string, Queue> = new Map()
  public workers: Map<string, Worker> = new Map()
  private defaultQueOptions: QueueOptions = {
    // defaultJobOptions: {
    //   attempts: 3,
    //   backoff: {
    //     type: 'exponential',
    //     delay: 2000,
    //   },
    // }
  }

  constructor(driverConfig: DriverConfig, defaultQueueOptions?: QueueOptions) {
    this.driverConfig = driverConfig;
    if (defaultQueueOptions) {
      this.defaultQueOptions = defaultQueueOptions
    }
  }

  createQ(queId: string, name: string, qOptions?: QueueOptions): Queue {
    // configure connection
    const driverConfig = this.driverConfig as unknown as typeof RedisConnection;

    // configure default options
    // TODO :: include defaultQueOptions support for each component
    const opts =  qOptions || this.defaultQueOptions;

    const q = new Queue(name, opts, driverConfig)
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