let myAccount;
(async() => {
    myAccount = await Account.getAccount();

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('#account-name').innerText = myAccount.name;
    });
})();