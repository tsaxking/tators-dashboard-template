// PRIORITY_1
const socket = io();

socket.on('get-alerts', () => {
    getAlerts();
});

socket.on('notification', ({ msg, title, status, length, permanent }) => {
    createNotification(title, msg, status, {
        length,
        permanent
    });
});

socket.on('push-notification', ({ msg, title }) => {
    pushNotification(title, msg);
});


let latencyTests = [];

const latencyTest = async(id = 0) => {
    return new Promise((res, rej) => {
        socket.emit('latency-test-init', id);
        latencyTests.push({
            id,
            res,
            rej
        });
    });
}

const multiLatencyTest = async(numTests) => {
    const results = await Promise.all(new Array(numTests).fill(0).map(async(_, i) => {
        return await latencyTest(i);
    }));

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const frequency = 1000 / avg;

    console.log('Average latency: ' + avg + 'ms');
    console.log('Frequency: ' + frequency + 'Hz');

    console.log(results);
}

socket.on('latency-test-init', ({ date, testId }) => {
    socket.emit('latency-test', { date, testId });
});

socket.on('latency-result', ({ result, testId }) => {
    // console.log('Latency: ' + result + 'ms');
    const test = latencyTests.find(t => t.id == testId);

    if (test) {
        test.res(result);
        latencyTests.splice(latencyTests.indexOf(test), 1);
    }
});

// let pingId = -1;
// const pingInterval = setInterval(() => {
//     pingId++;
//     socket.emit('ping');
//     setTimeout(() => {
//         if (pingId > 0) {
//             alert('Connection lost. Please refresh the page.');
//             pingId = -1;

//             clearInterval(pingInterval);
//         }
//     }, 1000 * 30);
// }, 1000 * 60);

// socket.on('pong', () => {
//     pingId = 0;


FIRST.subSocket = new SubSocket('first', socket);
FIRSTMatch.listener = FIRST.subSocket.on('match');
FIRSTTeam.listener = FIRST.subSocket.on('team');
FIRSTEvent.listener = FIRST.subSocket.on('event');
FIRSTAlliance.listener = FIRST.subSocket.on('alliance');
FIRSTMatchAlliance.listener = FIRST.subSocket.on('match-alliance');
MatchScouting.listener = FIRST.subSocket.on('match-scouting');
MatchScoutingCollection.listener = FIRST.subSocket.on('match-scouting-collection');
TatorInfo.listener = FIRST.subSocket.on('tator-info');