import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

parentPort?.postMessage('from worker 2');