"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var __arguments = process.argv.slice(2);
console.log('Arguments:', __arguments.map(function (a) { return '\x1b[35m' + a + '\x1b[0m'; }).join(' '));
var env = __arguments[0], args = __arguments.slice(1);
var modes = {
    dev: {
        type: 'development',
        description: 'In dev mode, only ts is rendered. This is the mode you should use when debugging',
        command: 'npm test',
        quickInfo: [
            'Static Files are \x1b[31mnot\x1b[0m combined or minified',
            'Debugging is \x1b[32measier\x1b[0m',
            'Uploads are \x1b[31mslower\x1b[0m',
            'Browser window is \x1b[32mspawned\x1b[0m'
        ]
    },
    test: {
        type: 'testing',
        description: 'This environment is similar to the production environment, but it will still auto login and spawn a browser window.',
        command: 'npm run dev',
        quickInfo: [
            'Static Files are \x1b[32mcombined\x1b[0m but not \x1b[32mminified\x1b[0m',
            'Debugging is \x1b[31mmore difficult\x1b[0m',
            'Uploads are \x1b[32mfaster\x1b[0m',
            'Browser window is \x1b[32mspawned\x1b[0m'
        ]
    },
    prod: {
        type: 'production',
        description: "In production, the idea is everything is more optimized. (This is a work in progress).",
        command: 'npm start',
        quickInfo: [
            'Static Files are \x1b[32mcombined\x1b[0m and \x1b[32mminified\x1b[0m',
            'Debugging is \x1b[31mmore difficult\x1b[0m',
            'Uploads are \x1b[32mfaster\x1b[0m',
            'Browser window is \x1b[31mnot spawned\x1b[0m'
        ]
    }
};
console.clear();
if (process.argv[2] == 'help') {
    console.log('Hello! Welcome to the help menu, please read the following information carefully.');
    console.log('Available modes:');
    // in red
    console.log('\x1b[32m' + 'all modes run "npm i" && "db-updates.js"' + '\x1b[0m');
    for (var mode in modes) {
        // log in colors (type = purple) (command = yellow) (description = white)
        console.log("\u001B[35m".concat(modes[mode].type, "\u001B[0m: \u001B[33m(").concat(modes[mode].command, ")\u001B[0m - ").concat(modes[mode].description));
        console.log(modes[mode].quickInfo.map(function (i) { return '    \x1b[34m-\x1b[0m ' + i; }).join('\n'));
    }
}
console.log("Currently, you are running in \u001B[35m".concat(modes[process.argv[2]].type, " mode.\u001B[0m"));
console.log(modes[process.argv[2]].quickInfo.map(function (i) { return '    \x1b[34m-\x1b[0m ' + i; }).join('\n'));
console.log('Please run "npm run help" to see all the modes available.');
var worker_threads_1 = require("worker_threads");
// import { runBuild, watchIgnoreList } from './build/build';
var path = require("path");
var child_process_1 = require("child_process");
var ts = require("typescript");
var server;
var newServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!server) return [3 /*break*/, 2];
                return [4 /*yield*/, server.terminate()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                server = new worker_threads_1.Worker(path.resolve(__dirname, 'server.js'), {
                    workerData: {
                        mode: process.argv[2],
                        args: process.argv.slice(3)
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
var build = function () {
    console.log('Building project');
    var build = new worker_threads_1.Worker(path.resolve(__dirname, 'build', 'build.js'), {
        workerData: {
            mode: process.argv[2],
            args: process.argv.slice(3)
        }
    });
    build.on('message', function (msg) {
        switch (msg) {
            case 'build-complete':
                console.log('Build complete');
                newServer();
                break;
            case 'build-start':
                console.log('Build started');
                break;
        }
    });
    build.on('error', console.error);
    build.on('exit', function (code) {
        if (code !== 0)
            console.error(new Error("Worker stopped with exit code ".concat(code)));
    });
};
var update = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (res, rej) {
                var update = new worker_threads_1.Worker(path.resolve(__dirname, 'build', 'server-update.js'), {
                    workerData: {
                        args: ['main']
                    }
                });
                update.on('message', function (msg) {
                    switch (msg) {
                        case 'update-complete':
                            console.log('Update complete');
                            res(update);
                            break;
                        case 'update-error':
                            console.error('There was an error updating the project');
                            break;
                        case 'update-warning':
                            console.warn('There was a warning updating the project');
                            break;
                    }
                });
                update.on('error', console.error);
                update.on('exit', function (code) {
                    if (code !== 0)
                        console.error(new Error("Worker stopped with exit code ".concat(code)));
                });
            })];
    });
}); };
var runTs = function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
    var program, emitResult, allDiagnostics, exitCode;
    return __generator(this, function (_a) {
        program = ts.createProgram([fileName], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true
        });
        emitResult = program.emit();
        allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        allDiagnostics.forEach(function (diagnostic) {
            if (diagnostic.file) {
                var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
                var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.log("".concat(diagnostic.file.fileName, " (").concat(line + 1, ",").concat(character + 1, "): ").concat(message));
            }
            else {
                console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            }
        });
        exitCode = emitResult.emitSkipped ? 1 : 0;
        if (exitCode !== 0) {
            throw new Error('There was an error compiling the project');
        }
        return [2 /*return*/];
    });
}); };
var npmi = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (res, rej) {
                var npm = (0, child_process_1.spawn)('npm', ['i'], {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'pipe',
                    shell: true
                });
                npm.stdout.on('data', function (data) {
                    console.log(data.toString());
                });
                npm.stderr.on('data', function (data) {
                    console.error(data.toString());
                });
                npm.on('close', function (code) {
                    if (code === 0) {
                        res();
                    }
                    else {
                        rej();
                    }
                });
            })];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!worker_threads_1.isMainThread) return [3 /*break*/, 5];
                return [4 /*yield*/, npmi()];
            case 1:
                _a.sent();
                return [4 /*yield*/, runTs('./server.ts')];
            case 2:
                _a.sent();
                return [4 /*yield*/, runTs('./build/build.ts')];
            case 3:
                _a.sent();
                return [4 /*yield*/, update()];
            case 4:
                _a.sent();
                build();
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); })();
