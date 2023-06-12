"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var databases_1 = require("../server-functions/databases");
var files_1 = require("../server-functions/files");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var Color;
(function (Color) {
    Color["red"] = "\u001B[31m";
    Color["green"] = "\u001B[32m";
    Color["yellow"] = "\u001B[33m";
    Color["blue"] = "\u001B[34m";
    Color["magenta"] = "\u001B[35m";
    Color["cyan"] = "\u001B[36m";
    Color["white"] = "\u001B[37m";
    Color["reset"] = "\u001B[0m";
})(Color || (Color = {}));
var failReason;
(function (failReason) {
    failReason["valueMismatch"] = "Value Mismatch";
    failReason["typeMismatch"] = "Type Mismatch";
    failReason["valueTypeMismatch"] = "Value and Type Mismatch";
    failReason["unknown"] = "Unknown";
    failReason["error"] = "Error";
    failReason["success"] = "Success";
})(failReason || (failReason = {}));
var runTest = function (test, db) { return __awaiter(void 0, void 0, void 0, function () {
    var r, expect, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, test.test(db)];
            case 1:
                result = _a.sent();
                expect = test.expect === undefined ? true : test.expect;
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                return [2 /*return*/, {
                        result: undefined,
                        success: false,
                        reason: failReason.error,
                        expected: test.expect,
                        error: e_1
                    }];
            case 3: return [2 /*return*/, {
                    result: result,
                    expected: test.expect,
                    success: result === expect,
                    reason: (function () {
                        if (result === expect)
                            return failReason.success;
                        if (result == expect && result !== expect)
                            return failReason.typeMismatch;
                        if (typeof result !== typeof expect && result != expect)
                            return failReason.valueTypeMismatch;
                        if (result != expect)
                            return failReason.valueMismatch;
                        return failReason.unknown;
                    })()
                }];
        }
    });
}); };
var run = function (tests, db) { return __awaiter(void 0, void 0, void 0, function () {
    var cols, numPassed, maxNameLength, _i, tests_1, test, start, _a, success, reason, expected, result, error, end, delta, reasonColor, resultColor, name_1, nameDots, emoji, output_1, outputString_1, endEmoji, endDots, rate, color, output, beginningString, dots, outputString;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.clear();
                cols = process.stdout.columns;
                numPassed = 0;
                maxNameLength = Math.max.apply(Math, tests.map(function (t) { return t.name.length; }));
                _i = 0, tests_1 = tests;
                _b.label = 1;
            case 1:
                if (!(_i < tests_1.length)) return [3 /*break*/, 5];
                test = tests_1[_i];
                start = Date.now();
                return [4 /*yield*/, runTest(test, db)];
            case 2:
                _a = _b.sent(), success = _a.success, reason = _a.reason, expected = _a.expected, result = _a.result, error = _a.error;
                end = Date.now();
                delta = end - start;
                reasonColor = void 0;
                switch (reason) {
                    case failReason.error:
                        reasonColor = Color.red;
                        break;
                    case failReason.success:
                        reasonColor = Color.green;
                        break;
                    case failReason.typeMismatch:
                        reasonColor = Color.yellow;
                        break;
                    case failReason.valueMismatch:
                        reasonColor = Color.blue;
                        break;
                    case failReason.valueTypeMismatch:
                        reasonColor = Color.magenta;
                        break;
                    case failReason.unknown:
                        reasonColor = Color.cyan;
                        break;
                }
                resultColor = void 0;
                if (success) {
                    resultColor = Color.green;
                    numPassed++;
                }
                else {
                    resultColor = Color.red;
                }
                name_1 = resultColor + test.name + Color.reset;
                nameDots = ('.').repeat(maxNameLength - test.name.length);
                emoji = success ? '✅' : '❌';
                output_1 = (success ?
                    Color.green + 'Passed' :
                    "Expected ".concat(expected, " (").concat(typeof expected, ") but got ").concat(result, " (").concat(typeof result, ") - ").concat(reasonColor).concat(reason)) + Color.reset;
                outputString_1 = "".concat(name_1, " ").concat(nameDots, " ").concat(output_1).concat(Color.reset, " ");
                endEmoji = " | ".concat(emoji, " ").concat(delta, "ms");
                endDots = ('.').repeat((cols + 21) - outputString_1.length - endEmoji.length);
                console.log(outputString_1 + endDots + endEmoji);
                return [4 /*yield*/, (0, files_1.log)(files_1.LogType.debugger, {
                        date: new Date().toISOString(),
                        name: test.name,
                        result: result,
                        expected: expected,
                        success: success,
                        reason: reason,
                        error: error ? error.toString() : undefined
                    })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5:
                console.log("\n\n" + ('-').repeat(cols));
                rate = Math.round(numPassed / tests.length * 100);
                color = rate == 100 ? Color.green : Color.red;
                output = " ".concat(color + rate + Color.reset, "% | ").concat(numPassed, "/").concat(tests.length, " passed");
                beginningString = 'Tests completed: ';
                dots = ('.').repeat((cols + 9) - beginningString.length - output.length);
                outputString = beginningString + dots + output;
                console.log(outputString);
                return [2 /*return*/];
        }
    });
}); };
var runTs = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (res, rej) { return __awaiter(void 0, void 0, void 0, function () {
                var tsConfig, program, emitResult, allDiagnostics, exitCode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, files_1.getJSON)(path.resolve(__dirname, filePath, './tsconfig.json'))];
                        case 1:
                            tsConfig = _a.sent();
                            program = typescript_1.default.createProgram([filePath], __assign(__assign({}, tsConfig.compilerOptions), { noEmitOnError: true }));
                            emitResult = program.emit();
                            allDiagnostics = typescript_1.default.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
                            allDiagnostics.forEach(function (diagnostic) {
                                if (diagnostic.file) {
                                    var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
                                    var message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                                    console.log("".concat(diagnostic.file.fileName, " (").concat(line + 1, ",").concat(character + 1, "): ").concat(message));
                                }
                                else {
                                    console.log(typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                                }
                            });
                            exitCode = emitResult.emitSkipped ? 1 : 0;
                            if (exitCode !== 0) {
                                console.error(new Error('There was an error compiling the project'));
                            }
                            res(null);
                            return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var dbPath, copy, db, tests, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dbPath = path.resolve(__dirname, '../db/main.db');
                copy = path.resolve(__dirname, '../db/debug.db');
                if (fs.existsSync(copy))
                    fs.unlinkSync(copy);
                fs.copyFileSync(dbPath, copy);
                db = new databases_1.DB('debug');
                return [4 /*yield*/, runTs(path.resolve(__dirname, './tests/'))];
            case 1:
                _a.sent();
                tests = new Array(100).fill(0).map(function (_, i) {
                    var generateRandom = function () {
                        var num = Math.floor(Math.random() * 10);
                        var str = Math.random() > 0.5 ? '' : 0;
                        return num + str;
                    };
                    return {
                        name: "Test ".concat(i),
                        expect: generateRandom(),
                        test: function (db) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, generateRandom()];
                            });
                        }); }
                    };
                });
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, run(tests, db)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_2 = _a.sent();
                if (e_2.toString().includes('Invalid count value')) {
                    console.error('Please zoom out of the terminal window, the output is too large to fit on the screen.');
                }
                return [3 /*break*/, 5];
            case 5:
                try {
                    fs.unlinkSync(copy);
                }
                catch (e) {
                    // console.error(e);
                }
                return [2 /*return*/];
        }
    });
}); })();
