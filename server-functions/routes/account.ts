import { NextFunction, Response, Router } from 'express';
import { Status } from '../structure/status';
import Role from '../structure/roles';
import Account from '../structure/accounts';
import { getTemplate } from '../files';

const router = Router();

// gets the account from the session
router.post('/get-account', async(req, res) => {
    const { account } = req.session;

    if (account) res.json(account.safe);
    else Status.from('account.notLoggedIn', req).send(res);
});


// gets all roles available
router.post('/get-roles', async(req, res) => {
    res.json(await Role.all());
});

router.get('/sign-in', async (req, res) => {
    res.send(await getTemplate('account/sign-in'));
});

router.get('/sign-up', async (req, res) => {
    res.send(await getTemplate('account/sign-up'));
});

router.post('/sign-in', Account.notSignedIn, async(req, res) => {
    const { 
        'Username or Email': username,
        'Password': password
    } = req.body;

    const account = await Account.fromUsername(username);

    // send the same error for both username and password to prevent username enumeration
    if (!account) return Status.from('account.invalidUsernameOrPassword', req, { username: username }).send(res);

    const hash = Account.hash(password, account.salt);
    if (hash !== account.key) 
        return Status
            .from('account.invalidUsernameOrPassword', req, { username: username })
            .send(res);
    if (!account.verified) return Status.from('account.notVerified', req, { username: username }).send(res);

    req.session.signIn(account);

    Status.from('account.loggedIn', req, { username: username }).send(res);
});





router.post('/sign-up', Account.notSignedIn, async(req, res) => {
    const {
        'Username': username,
        'Password': password,
        'Confirm Password': confirmPassword,
        'Name': name,
        'Email': email
    } = req.body;

    if (password !== confirmPassword) return Status.from('account.passwordMismatch', req).send(res);

    const status = await Account.create(username, password, name, email);

    Status.from('account.' + status, req).send(res);
});







// req.session.account is always available when Account.allowRoles/Permissions is used
// however, typescript doesn't know that, so we have to cast it

router.post('/verify-account', Account.allowPermissions('verify'), async(req, res) => {
    const { username } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const status = await Account.verify(username);
    Status.from('account.' + status, req).send(res);
});







router.post('/reject-account', Account.allowPermissions('verify'), async(req, res) => {
    const { username } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const account = await Account.fromUsername(username);
    if (!account) return Status.from('account.notFound', req, { username }).send(res);

    if (account.verified) return Status.from('account.cannotRejectVerified', req, { username }).send(res);

    const status = await Account.delete(username);
    Status.from('account.' + status, req, { username }).send(res);
});






router.post('/get-pending-accounts', Account.allowPermissions('verify'), async(req, res) => {
    const accounts = await Account.unverifiedAccounts();
    res.json(accounts.map(a => a.safe));
});








router.post('/get-all', async (req, res) => {
    const accounts = await Account.all();
    res.json(accounts.map(a => a.safe));
});



router.post('/remove-account', Account.allowPermissions('editUsers'), async(req, res) => {
    const { username } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const status = await Account.delete(username);
    Status.from('account.' + status, req, { username }).send(res);
});







router.post('/unverify-account', Account.allowPermissions('verify'), async(req, res) => {
    const { username } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const status = await Account.unVerify(username);
    Status.from('account.' + status, req, { username }).send(res);
});





router.post('/add-role', Account.allowPermissions('editRoles'), async(req, res) => {
    const { username, role } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const account = await Account.fromUsername(username);
    if (!account) return Status.from('account.notFound', req, { username }).send(res);

    const status = await account.addRole(role);
    Status.from('account.' + status, req, { username, role }).send(res);
});






router.post('/remove-role', Account.allowPermissions('editRoles'), async(req, res) => {
    const { username, role } = req.body;

    if (username === req.session.account?.username) return Status.from('account.cannotEditSelf', req).send(res);

    const account = await Account.fromUsername(username);
    if (!account) return Status.from('account.notFound', req, { username }).send(res);

    const status = await account.removeRole(role);
    Status.from('account.' + status, req, { username, role }).send(res);
});

// TODO: Password resetting



export default router;