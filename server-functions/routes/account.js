"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const status_1 = require("../structure/status");
const roles_1 = __importDefault(require("../structure/roles"));
const accounts_1 = __importDefault(require("../structure/accounts"));
const files_1 = require("../files");
const router = (0, express_1.Router)();
// gets the account from the session
router.post('/get-account', async (req, res) => {
    const { account } = req.session;
    if (account)
        res.json(account.safe);
    else
        status_1.Status.from('account.notLoggedIn', req).send(res);
});
// gets all roles available
router.post('/get-roles', async (req, res) => {
    res.json(await roles_1.default.all());
});
// sign in page (sign up is the same)
const getSignIn = async (req, res) => {
    const html = await (0, files_1.getTemplate)('/accounts/sign-in');
    res.send(html);
};
router.get('/sign-in', accounts_1.default.allowRoles('guest'), getSignIn);
router.get('/sign-up', accounts_1.default.allowRoles('guest'), getSignIn);
router.post('/sign-in', accounts_1.default.allowRoles('guest'), async (req, res) => {
    const { username, password } = req.body;
    const account = await accounts_1.default.fromUsername(username);
    // send the same error for both username and password to prevent username enumeration
    if (!account)
        return status_1.Status.from('account.invalidUsernameOrPassword', req, { username }).send(res);
    const hash = accounts_1.default.hash(password, account.salt);
    if (hash !== account.key)
        return status_1.Status.from('account.invalidUsernameOrPassword', req, { username }).send(res);
    if (!account.verified)
        return status_1.Status.from('account.notVerified', req, { username }).send(res);
    req.session.signIn(account);
    status_1.Status.from('account.loggedIn', req, { username }).send(res);
});
router.post('/sign-up', accounts_1.default.allowRoles('guest'), async (req, res) => {
    const { username, password, confirmPassword, name, email } = req.body;
    if (password !== confirmPassword)
        return status_1.Status.from('account.passwordMismatch', req).send(res);
    const status = await accounts_1.default.create(username, password, name, email);
    status_1.Status.from('account.' + status, req).send(res);
});
// req.session.account is always available when Account.allowRoles/Permissions is used
// however, typescript doesn't know that, so we have to cast it
router.post('/verify-account', accounts_1.default.allowPermissions('verify'), async (req, res) => {
    const { username } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const status = await accounts_1.default.verify(username);
    status_1.Status.from('account.' + status, req).send(res);
});
router.post('/reject-account', accounts_1.default.allowPermissions('verify'), async (req, res) => {
    const { username } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const account = await accounts_1.default.fromUsername(username);
    if (!account)
        return status_1.Status.from('account.notFound', req, { username }).send(res);
    if (account.verified)
        return status_1.Status.from('account.cannotRejectVerified', req, { username }).send(res);
    const status = await accounts_1.default.delete(username);
    status_1.Status.from('account.' + status, req, { username }).send(res);
});
router.post('/get-pending-accounts', accounts_1.default.allowPermissions('verify'), async (req, res) => {
    const accounts = await accounts_1.default.unverifiedAccounts();
    res.json(accounts.map(a => a.safe));
});
router.post('/get-all', async (req, res) => {
    const accounts = await accounts_1.default.all();
    res.json(accounts.map(a => a.safe));
});
router.post('/remove-account', accounts_1.default.allowPermissions('editUsers'), async (req, res) => {
    const { username } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const status = await accounts_1.default.delete(username);
    status_1.Status.from('account.' + status, req, { username }).send(res);
});
router.post('/unverify-account', accounts_1.default.allowPermissions('verify'), async (req, res) => {
    const { username } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const status = await accounts_1.default.unVerify(username);
    status_1.Status.from('account.' + status, req, { username }).send(res);
});
router.post('/add-role', accounts_1.default.allowPermissions('editRoles'), async (req, res) => {
    const { username, role } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const account = await accounts_1.default.fromUsername(username);
    if (!account)
        return status_1.Status.from('account.notFound', req, { username }).send(res);
    const status = await account.addRole(role);
    status_1.Status.from('account.' + status, req, { username, role }).send(res);
});
router.post('/remove-role', accounts_1.default.allowPermissions('editRoles'), async (req, res) => {
    const { username, role } = req.body;
    if (username === req.session.account?.username)
        return status_1.Status.from('account.cannotEditSelf', req).send(res);
    const account = await accounts_1.default.fromUsername(username);
    if (!account)
        return status_1.Status.from('account.notFound', req, { username }).send(res);
    const status = await account.removeRole(role);
    status_1.Status.from('account.' + status, req, { username, role }).send(res);
});
// TODO: Password resetting
exports.default = router;
