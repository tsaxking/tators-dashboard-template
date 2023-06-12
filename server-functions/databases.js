"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAIN = exports.DB = void 0;
var sqlite3 = __importStar(require("sqlite3"));
var sqlite_1 = require("sqlite");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var files_1 = require("./files");
var QueryType;
(function (QueryType) {
    QueryType["exec"] = "exec";
    QueryType["get"] = "get";
    QueryType["all"] = "all";
    QueryType["each"] = "each";
    QueryType["run"] = "run";
})(QueryType || (QueryType = {}));
var Query = /** @class */ (function () {
    function Query(type, query, resolve, reject, params) {
        this.type = type;
        this.query = query;
        this.params = params || [];
        this.resolve = resolve;
        this.reject = reject;
    }
    return Query;
}());
var DB = /** @class */ (function () {
    function DB(filename) {
        this.filename = filename;
        this.queue = [];
        this.queueRunning = false;
        this.path = path.join(__dirname, '..', 'db', './' + filename + '.db');
        if (!fs.existsSync(path.join(__dirname, '..', 'db'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'db'));
        }
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, '');
        }
        this.init();
    }
    DB.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.db)
                            return [2 /*return*/];
                        _a = this;
                        return [4 /*yield*/, (0, sqlite_1.open)({
                                filename: this.path,
                                driver: sqlite3.Database
                            })];
                    case 1:
                        _a.db = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DB.prototype.runQueue = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var query_1, d, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.queue.push(query);
                        if (this.queueRunning)
                            return [2 /*return*/];
                        this.queueRunning = true;
                        _a.label = 1;
                    case 1:
                        if (!(this.queue.length > 0)) return [3 /*break*/, 6];
                        query_1 = this.queue[0];
                        if (!query_1)
                            return [3 /*break*/, 1];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.runQuery(query_1)];
                    case 3:
                        d = _a.sent();
                        query_1.resolve(d);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        query_1.reject(err_1);
                        return [3 /*break*/, 5];
                    case 5:
                        this.queue.shift();
                        return [3 /*break*/, 1];
                    case 6:
                        this.queueRunning = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    DB.prototype.runQuery = function (query) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var data, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _g.sent();
                        _f = query.type;
                        switch (_f) {
                            case QueryType.exec: return [3 /*break*/, 2];
                            case QueryType.get: return [3 /*break*/, 4];
                            case QueryType.all: return [3 /*break*/, 6];
                            case QueryType.each: return [3 /*break*/, 8];
                            case QueryType.run: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 2: return [4 /*yield*/, ((_a = this.db) === null || _a === void 0 ? void 0 : _a.exec(query.query, query.params))];
                    case 3:
                        data = _g.sent();
                        return [3 /*break*/, 12];
                    case 4: return [4 /*yield*/, ((_b = this.db) === null || _b === void 0 ? void 0 : _b.get(query.query, query.params))];
                    case 5:
                        data = _g.sent();
                        return [3 /*break*/, 12];
                    case 6: return [4 /*yield*/, ((_c = this.db) === null || _c === void 0 ? void 0 : _c.all(query.query, query.params))];
                    case 7:
                        data = _g.sent();
                        return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, ((_d = this.db) === null || _d === void 0 ? void 0 : _d.each(query.query, query.params))];
                    case 9:
                        data = _g.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, ((_e = this.db) === null || _e === void 0 ? void 0 : _e.run(query.query, query.params))];
                    case 11:
                        data = _g.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, data];
                }
            });
        });
    };
    DB.prototype.run = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.runQueue(new Query(QueryType.run, query, resolve, reject, params));
                    })];
            });
        });
    };
    DB.prototype.exec = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.runQueue(new Query(QueryType.exec, query, resolve, reject, params));
                    })];
            });
        });
    };
    DB.prototype.get = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.runQueue(new Query(QueryType.get, query, resolve, reject, params));
                    })];
            });
        });
    };
    DB.prototype.all = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.runQueue(new Query(QueryType.all, query, resolve, reject, params));
                    })];
            });
        });
    };
    DB.prototype.each = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.runQueue(new Query(QueryType.each, query, resolve, reject, params));
                    })];
            });
        });
    };
    DB.prototype.info = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tableData, query, tables;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, files_1.getJSON)('/tables')];
                    case 1:
                        tableData = _a.sent();
                        query = "\n            SELECT name\n            FROM sqlite_schema\n            WHERE \n                type ='table' AND \n                name NOT LIKE 'sqlite_%';\n        ";
                        return [4 /*yield*/, exports.MAIN.all(query)];
                    case 2:
                        tables = _a.sent();
                        return [2 /*return*/, Promise.all(tables.map(function (_a) {
                                var name = _a.name;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var data;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, exports.MAIN.all("PRAGMA table_info(".concat(name, ")"))];
                                            case 1:
                                                data = _b.sent();
                                                return [2 /*return*/, {
                                                        table: name,
                                                        data: tableData[name],
                                                        columns: data.map(function (d) {
                                                            var _a, _b, _c, _d;
                                                            return {
                                                                name: d.name,
                                                                type: d.type,
                                                                jsType: (_b = (_a = tableData[name]) === null || _a === void 0 ? void 0 : _a.columns[d.name]) === null || _b === void 0 ? void 0 : _b.type,
                                                                description: (_d = (_c = tableData[name]) === null || _c === void 0 ? void 0 : _c.columns[d.name]) === null || _d === void 0 ? void 0 : _d.description,
                                                                notnull: d.notnull
                                                            };
                                                        })
                                                    }];
                                        }
                                    });
                                });
                            }))];
                }
            });
        });
    };
    return DB;
}());
exports.DB = DB;
exports.MAIN = new DB('main');
