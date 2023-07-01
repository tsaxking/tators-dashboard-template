import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as path from 'path';


if (isMainThread) {
    const worker = new Worker(__filename, { workerData: 'hello' });

    worker.on('message', console.log);
} else {
    const newWorker = new Worker(path.resolve(
        __dirname, 'worker-1.js'
    ), { workerData: 'world' });

    newWorker.on('message', (msg) => {
        parentPort?.postMessage(msg);
    });

    parentPort?.postMessage('from worker 1');
}