class Ping {
    constructor() {
        this.latency = 0;
    }

    async run() {
        return new Promise(async (res, rej) => {
            const start = Date.now();

            setTimeout(() => {
                res(1000 * 30);
            }, 1000 * 30);

            await fetch('/api/ping', { method: 'POST' })
                .catch(() => {
                    res(1000 * 30);
                });
            this.latency = Date.now() - start;
            res(this.latency);
        });
    }
}

const globalPing = new Ping();
document.addEventListener('DOMContentLoaded', () => {
    const runLatencyTest = async() => {
        const latency = await globalPing.run();
        const goodColor = new Color(0, 255, 0);
        const badColor = new Color(255, 0, 0);

        const latencyColor = goodColor.interpolate(badColor, (() => {
            if (latency < 100) return 0;
            if (latency > 3000) return 1;
            return latency / 3000;
        })());


        document.querySelector('#latency').style.color = latencyColor.toString('rgb');
    }

    globalPing.interval = setInterval(runLatencyTest, 1000 * 1);
    runLatencyTest();
});