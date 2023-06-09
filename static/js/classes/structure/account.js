class Account {
    static async getAccount() {
        const account = await fetch('/account/get-account', {method: 'POST'}).then(res => res.json());
        return new Account(account);
    }

    constructor(accountObj) {
        Object.assign(this, accountObj);
    }
}