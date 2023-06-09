"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailValidation = void 0;
// const SpamScanner = require('spamscanner');
const deep_email_validator_1 = require("deep-email-validator");
// export const detectSpam = (keys: string[], options: Options = {}): NextFunction => {
//         const fn = (req: Request, res: Response, next: NextFunction) => {
//         const arr = keys.map(key => req.body[key]);
//         if (!arr.length) return next();    
//         const scanner = new SpamScanner();
//         Promise.all(arr.map(value => scanner.scan(value)))
//             .then(results => {
//                 const isSpam = results.some(result => result.is_spam);
//                 if (isSpam) {
//                     req.body.__spamResults = results;
//                     if (options.onspam) return options.onspam(req, res, next);
//                     if (options.goToNext) next();
//                     return;
//                 }
//                 next();
//             })
//             .catch(err => {
//                 console.log(err);
//                 if (options.onerror) options.onerror(req, res, next);
//             })
//     }
//     return fn as NextFunction;
// };
const emailValidation = (keys, options = {}) => {
    const fn = (req, res, next) => {
        const arr = keys.map(key => req.body[key]);
        if (!arr.length)
            return next();
        Promise.all(arr.map(value => (0, deep_email_validator_1.validate)({ email: value })))
            .then((results) => {
            const valid = results.every(result => result.valid);
            if (valid)
                return next();
            req.body.__emailResults = results;
            if (options.onspam)
                return options.onspam(req, res, next);
            if (options.goToNext)
                next();
        })
            .catch(err => {
            if (options.onerror)
                return options.onerror(req, res, next);
            console.error(err);
            next();
        });
    };
    return fn;
};
exports.emailValidation = emailValidation;
