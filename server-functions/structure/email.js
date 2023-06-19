"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = exports.EmailType = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_sendgrid_transport_1 = __importDefault(require("nodemailer-sendgrid-transport"));
const dotenv_1 = require("dotenv");
const files_1 = require("../files");
(0, dotenv_1.config)();
const transporter = nodemailer_1.default.createTransport((0, nodemailer_sendgrid_transport_1.default)({
    service: 'gmail',
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));
var EmailType;
(function (EmailType) {
    EmailType[EmailType["link"] = 0] = "link";
    EmailType[EmailType["text"] = 1] = "text";
    EmailType[EmailType["error"] = 2] = "error";
})(EmailType = exports.EmailType || (exports.EmailType = {}));
class Email {
    to;
    subject;
    type;
    options;
    constructor(to, subject, type, options) {
        this.to = to;
        this.subject = subject;
        this.type = type;
        this.options = options;
    }
    send() {
        const { to, subject, type, options } = this;
        let { attachments, constructor } = options;
        constructor = {
            ...(constructor || {}),
            logo: (process.env.DOMAIN || '') + (process.env.LOGO || ''),
            homeLink: (process.env.DOMAIN || '') + (process.env.HOME_LINK || ''),
            footer: (process.env.FOOTER || '')
        };
        let html;
        let temp;
        switch (type) {
            case EmailType.link:
                temp = (0, files_1.getTemplateSync)('emails/link', constructor);
                html = typeof temp === 'string' ? temp : '';
                break;
            case EmailType.text:
                temp = (0, files_1.getTemplateSync)('emails/text', constructor);
                html = typeof temp === 'string' ? temp : '';
                break;
            case EmailType.error:
                temp = (0, files_1.getTemplateSync)('emails/error', constructor);
                html = typeof temp === 'string' ? temp : '';
                break;
            default:
                html = '';
                break;
        }
        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            html,
            attachments
        };
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log('Email sent: ' + info.response);
                    resolve(info);
                }
            });
        });
    }
}
exports.Email = Email;
