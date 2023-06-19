"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const status_1 = require("../structure/status");
const files_1 = require("../files");
const databases_1 = require("../databases");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { key } = req.query;
    if (!key || key !== process.env.ADMIN_KEY)
        return status_1.Status.from('admin.invalidKey', req).send(res);
    const html = await (0, files_1.getTemplate)('/admin', {
        serverKey: process.env.ADMIN_KEY
    });
    res.send(html);
});
router.post('/database', async (req, res, next) => {
    res.json(await databases_1.MAIN.info());
});
// TODO: build table query search route
router.post('/table', async (req, res, next) => { });
exports.default = router;
