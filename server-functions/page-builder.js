"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builds = {
// put your pages here:
/*
example:
    '/account': async (req: Request) => {
        const { account } = req.session;

        if (account) {
            const template = await getTemplate('account', account); // uses node-html-constructor if you pass in the second parameter
            return template;
        }

        return 'You are not logged in.';
    }
*/
};
exports.default = async (req, res, next) => {
    const { url } = req;
    if (builds[url]) {
        res.send(await builds[url](req));
    }
    else {
        next();
    }
};
