"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.ColorCode = exports.ServerCode = void 0;
const files_1 = require("../files");
const accounts_1 = __importDefault(require("./accounts"));
const email_1 = require("./email");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var ServerCode;
(function (ServerCode) {
    ServerCode[ServerCode["continue"] = 100] = "continue";
    ServerCode[ServerCode["switchingProtocols"] = 101] = "switchingProtocols";
    ServerCode[ServerCode["processing"] = 102] = "processing";
    ServerCode[ServerCode["earlyHints"] = 103] = "earlyHints";
    ServerCode[ServerCode["ok"] = 200] = "ok";
    ServerCode[ServerCode["created"] = 201] = "created";
    ServerCode[ServerCode["accepted"] = 202] = "accepted";
    ServerCode[ServerCode["nonAuthoritativeInformation"] = 203] = "nonAuthoritativeInformation";
    ServerCode[ServerCode["noContent"] = 204] = "noContent";
    ServerCode[ServerCode["resetContent"] = 205] = "resetContent";
    ServerCode[ServerCode["partialContent"] = 206] = "partialContent";
    ServerCode[ServerCode["multiStatus"] = 207] = "multiStatus";
    ServerCode[ServerCode["alreadyReported"] = 208] = "alreadyReported";
    ServerCode[ServerCode["imUsed"] = 226] = "imUsed";
    ServerCode[ServerCode["multipleChoices"] = 300] = "multipleChoices";
    ServerCode[ServerCode["movedPermanently"] = 301] = "movedPermanently";
    ServerCode[ServerCode["found"] = 302] = "found";
    ServerCode[ServerCode["seeOther"] = 303] = "seeOther";
    ServerCode[ServerCode["notModified"] = 304] = "notModified";
    ServerCode[ServerCode["useProxy"] = 305] = "useProxy";
    ServerCode[ServerCode["unused"] = 306] = "unused";
    ServerCode[ServerCode["temporaryRedirect"] = 307] = "temporaryRedirect";
    ServerCode[ServerCode["permanentRedirect"] = 308] = "permanentRedirect";
    ServerCode[ServerCode["badRequest"] = 400] = "badRequest";
    ServerCode[ServerCode["unauthorized"] = 401] = "unauthorized";
    ServerCode[ServerCode["paymentRequired"] = 402] = "paymentRequired";
    ServerCode[ServerCode["forbidden"] = 403] = "forbidden";
    ServerCode[ServerCode["notFound"] = 404] = "notFound";
    ServerCode[ServerCode["methodNotAllowed"] = 405] = "methodNotAllowed";
    ServerCode[ServerCode["notAcceptable"] = 406] = "notAcceptable";
    ServerCode[ServerCode["proxyAuthenticationRequired"] = 407] = "proxyAuthenticationRequired";
    ServerCode[ServerCode["requestTimeout"] = 408] = "requestTimeout";
    ServerCode[ServerCode["conflict"] = 409] = "conflict";
    ServerCode[ServerCode["gone"] = 410] = "gone";
    ServerCode[ServerCode["lengthRequired"] = 411] = "lengthRequired";
    ServerCode[ServerCode["preconditionFailed"] = 412] = "preconditionFailed";
    ServerCode[ServerCode["payloadTooLarge"] = 413] = "payloadTooLarge";
    ServerCode[ServerCode["uriTooLong"] = 414] = "uriTooLong";
    ServerCode[ServerCode["unsupportedMediaType"] = 415] = "unsupportedMediaType";
    ServerCode[ServerCode["rangeNotSatisfiable"] = 416] = "rangeNotSatisfiable";
    ServerCode[ServerCode["expectationFailed"] = 417] = "expectationFailed";
    ServerCode[ServerCode["imATeapot"] = 418] = "imATeapot";
    ServerCode[ServerCode["misdirectedRequest"] = 421] = "misdirectedRequest";
    ServerCode[ServerCode["unprocessableEntity"] = 422] = "unprocessableEntity";
    ServerCode[ServerCode["locked"] = 423] = "locked";
    ServerCode[ServerCode["failedDependency"] = 424] = "failedDependency";
    ServerCode[ServerCode["tooEarly"] = 425] = "tooEarly";
    ServerCode[ServerCode["upgradeRequired"] = 426] = "upgradeRequired";
    ServerCode[ServerCode["preconditionRequired"] = 428] = "preconditionRequired";
    ServerCode[ServerCode["tooManyRequests"] = 429] = "tooManyRequests";
    ServerCode[ServerCode["requestHeaderFieldsTooLarge"] = 431] = "requestHeaderFieldsTooLarge";
    ServerCode[ServerCode["unavailableForLegalReasons"] = 451] = "unavailableForLegalReasons";
    ServerCode[ServerCode["internalServerError"] = 500] = "internalServerError";
    ServerCode[ServerCode["notImplemented"] = 501] = "notImplemented";
    ServerCode[ServerCode["badGateway"] = 502] = "badGateway";
    ServerCode[ServerCode["serviceUnavailable"] = 503] = "serviceUnavailable";
    ServerCode[ServerCode["gatewayTimeout"] = 504] = "gatewayTimeout";
    ServerCode[ServerCode["httpVersionNotSupported"] = 505] = "httpVersionNotSupported";
    ServerCode[ServerCode["variantAlsoNegotiates"] = 506] = "variantAlsoNegotiates";
    ServerCode[ServerCode["insufficientStorage"] = 507] = "insufficientStorage";
    ServerCode[ServerCode["loopDetected"] = 508] = "loopDetected";
    ServerCode[ServerCode["notExtended"] = 510] = "notExtended";
    ServerCode[ServerCode["networkAuthenticationRequired"] = 511] = "networkAuthenticationRequired";
})(ServerCode = exports.ServerCode || (exports.ServerCode = {}));
var ColorCode;
(function (ColorCode) {
    ColorCode["success"] = "success";
    ColorCode["error"] = "danger";
    ColorCode["warning"] = "warning";
    ColorCode["info"] = "info";
    ColorCode["majorError"] = "danger";
})(ColorCode = exports.ColorCode || (exports.ColorCode = {}));
const messages = (0, files_1.getJSONSync)('status-messages');
if (!messages) {
    throw new Error('Unable to load status messages.');
}
class Status {
    title;
    message;
    status;
    code;
    instructions;
    redirect;
    request;
    data;
    static middleware(id, test) {
        return (req, res, next) => {
            if (test(req.session)) {
                next();
            }
            else {
                const status = Status.from(id, req);
                status.send(res);
            }
        };
    }
    static from(id, req, data) {
        try {
            data = JSON.stringify(data);
        }
        catch (e) {
            console.error('Unable to stringify data for status message.', e);
            data = undefined;
        }
        const message = messages[id];
        if (!message) {
            return new Status('Unknown Error', 'An unknown error has occurred.', ColorCode.error, ServerCode.internalServerError, 'Please contact the administrator.', false, req, data);
        }
        return new Status(message.title, message.message, message.status, message.code, message.instructions, message.redirect || false, req, data);
    }
    constructor(title, message, status, code, instructions, redirect = false, request, data) {
        this.title = title;
        this.message = message;
        this.status = status;
        this.code = code;
        this.instructions = instructions;
        this.redirect = redirect;
        this.request = request;
        this.data = data;
        (0, files_1.log)(files_1.LogType.status, {
            date: Date.now(),
            sessionId: request.session.id,
            username: request.session.account?.username,
            ip: request.session.ip,
            email: request.session.account?.email,
            title,
            code,
            data: data || 'No data provided.'
        });
        // Send email to admins if error
        if (status === ColorCode.majorError && process.env.SEND_STATUS_EMAILS === 'TRUE') {
            accounts_1.default.fromRole('admin')
                .then(admins => {
                const email = new email_1.Email(admins.map(admin => admin.email), 'Error: ' + title, email_1.EmailType.error, {
                    constructor: {
                        title,
                        message,
                        code,
                        sessionId: request.session.id,
                        username: request.session.account?.username,
                        ip: request.session.ip,
                        email: request.session.account?.email,
                    }
                });
                email.send()
                    .catch(console.error);
            })
                .catch(console.error);
        }
    }
    get html() {
        return (0, files_1.getTemplateSync)('status', this);
    }
    get json() {
        return {
            title: this.title,
            message: this.message,
            status: this.status,
            code: this.code,
            instructions: this.instructions,
            data: JSON.parse(this.data || '{}')
        };
    }
    send(res) {
        switch (this.request.method) {
            case 'GET':
                res.status(this.code).send(this.html);
                break;
            case 'POST':
                res.status(this.code).json(this.json);
                break;
            default:
                res.status(this.code).send(this.html);
                break;
        }
    }
}
exports.Status = Status;
