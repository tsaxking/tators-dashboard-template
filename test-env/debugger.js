// copy database
/*
        // run the test
        const start = Date.now();
        const { result, expect, passed, reason } = await runTest(test.test, test.expect, DB);
        const end = Date.now();

        // generate the string
        const emoji = passed ? '✅' : '❌';
        const output = (passed ? 'Passed | ' : ` Expected ${expect}, got ${result} - ${reason} | `) + emoji;
        const name = test.name;

        // console colors
        const green = '\x1b[32m';
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        const color = passed ? green : red;

        // generate the dots
        const dots = ('.').repeat(cols - 3 - name.length - output.length);

        const nameDots = ('.').repeat(cols - dots.length - name.length);

        // output string is [name] ......... [emoji  + output] that fills the console
        const outputString = `${color + name + reset} ${output} ${dots}`;
        console.log(outputString);
*/

const { APP_DB } = require('../server-functions/databases');
const { log } = require('../server-functions/files');
const fs = require('fs');
const path = require('path');



if (!fs.existsSync(path.resolve(__dirname, 'tests'))) {
    fs.mkdirSync(path.resolve(__dirname, 'tests'));
}

const tests = fs.readdirSync(path.resolve(__dirname, 'tests')).map(file => {
    if (file.endsWith('.js')) {
        file = file.replace('.js', '');
        console.log('imported test:', file);
        return require('./tests/' + file);
    }
}).filter(t => t);


// for testing the debugger
// const tests = new Array(100).fill(0).map((_, i) => {
//     const generateRandom = () => {
//         const num = Math.floor(Math.random() * 10);
//         const str = Math.random() > 0.5 ? '' : 0;
//         return num + str;
//     }

//     return {
//         name: `Test ${i}`,
//         expect: generateRandom(),
//         test: async(DB) => {
//             return generateRandom();
//         }
//     }
// });


const runTest = async(fn, expect, DB) => {
    const result = await fn(DB);
    expect = expect === undefined ? true : expect;

    return {
        result,
        expect,
        passed: result === expect,
        reason: (() => {
            if (result != expect) {
                if (typeof result !== typeof expect) return 'Type and value mismatch';
                return 'Value mismatch';
            }
            if (result == expect && result !== expect) return 'Type mismatch';
            if (result === expect) return 'Passed';
            return 'Unknown';
        })()
    }
}

const runTests = async(tests, DB) => {
    console.clear();
    const cols = process.stdout.columns;
    
    let numPassed = 0;

    const maxNameLength = Math.max(...tests.map(t => t.name.length)) + 5;

    for (const test of tests) {
        const start = Date.now();
        const { result, expect, passed, reason } = await runTest(test.test, test.expect, DB);
        const end = Date.now();


        const green = '\x1b[32m';
        const red = '\x1b[31m';
        const blue = '\x1b[34m';
        const yellow = '\x1b[33m';
        const magenta = '\x1b[35m';
        const cyan = '\x1b[36m';
        const bgRed = '\x1b[41m';
        const reset = '\x1b[0m';
        const color = passed ? green : red;

        let reasonColor;
        switch(reason) {
            case 'Passed':
                reasonColor = green;
                break;
            case 'Value mismatch':
                reasonColor = yellow;
                break;
            case 'Type mismatch':
                reasonColor = cyan;
                break;
            case 'Type and value mismatch':
                reasonColor = red;
                break;
            default:
                reasonColor = bgRed;
                break;
        }

        const nameString = color + test.name + reset;
        const nameDots = ('.').repeat(maxNameLength - test.name.length);
        const emoji = passed ? '✅' : '❌';

        const output = (passed ? `${green}Passed` : `Expected ${expect}, got ${result} - ${reasonColor}${reason}`);

        const outputString = `${nameString} ${nameDots} ${output}${reset} `;
        const endEmoji = ' | ' + emoji;
        const endDots = ('.').repeat(cols + 17 - outputString.length - endEmoji.length);
        console.log(outputString + endDots + endEmoji);












        await log('debugger', {
            date: new Date().toISOString(),
            name: test.name,
            expect,
            result,
            passed,
            duration: end - start,
            reason
        });

        if (passed) numPassed++;
    }

    console.log('\n\n' + '-'.repeat(cols));
    const rate = Math.round(numPassed / tests.length * 100);

    const green = '\x1b[32m';
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    const color = rate == 100 ? green : red;

    const output = `${rate}% | ${numPassed}/${tests.length} passed`;

    const beginningString = 'Tests completed: ';

    const dots = ('.').repeat(cols - 2 - beginningString.length - output.length);

    const outputString = `${color + beginningString + reset} ${dots} ${output}`;
    console.log(outputString);
}



(async() => {
    const dbPath = path.resolve(__dirname, '..', 'db', 'main.db');
    const dbCopyPath = path.resolve(__dirname, '..', 'db', 'debug.db');

    // deletes the copy if it exists
    // This is important because someone may stop a test in the middle of running "npm run debug"
    if (fs.existsSync(dbCopyPath)) {
        fs.unlinkSync(dbCopyPath);
    }

    // copy the database
    fs.copyFileSync(dbPath, dbCopyPath);

    const DB = new APP_DB('./debug.db');

    // run the tests
    await runTests(tests, DB);

    // delete the copy
    fs.unlinkSync(dbCopyPath);
})();