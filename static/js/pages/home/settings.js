const st_selectFieldOrientation = new CustomBootstrap.Select(document.querySelector('#st--field-orientation-select'));

st_selectFieldOrientation.addOption('Normal Orientation', 'normal', false, [
]);

st_selectFieldOrientation.addOption('Rotate 180', 'rotate-180', false, [
    'rotate-180',
    // 'mirror-x',
    // 'mirror-y'
]);

st_selectFieldOrientation.addOption('Flip about X', 'mirror-x', false, [
    'mirror-x'
]);

st_selectFieldOrientation.addOption('Flip about Y', 'mirror-y', false, [
    'mirror-y'
]);

const st_checkboxes = new CustomBootstrap.CheckboxGroup(document.querySelector('#st--checkboxes'));
st_checkboxes.addOption('Hide Practice Matches', 'hide-practice-matches');


mainFunctions.Settings = async() => {
    st_checkboxes.deselectAll();

    const allRoles = await requestFromServer({
        url: '/account/get-roles',
        method: 'POST'
    });

    const getPendingAccounts = async() => {

        const pendingRequests = currentPage.querySelector('#st--pending-requests');

        const pendingAccounts = await requestFromServer({
            url: '/account/get-pending-accounts',
            method: 'POST'
        });

        pendingAccounts.forEach(account => {
            const col = document.createElement('div');
            col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

            const card = document.createElement('div');
            card.classList.add('card', 'mb-3');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.innerText = account.username;

            const cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.innerText = account.firstName + ' ' + account.lastName;

            const cardFooter = document.createElement('div');
            cardFooter.classList.add('card-footer');

            const acceptButton = document.createElement('button');
            acceptButton.classList.add('btn', 'btn-success', 'me-2');

            acceptButton.innerHTML = `
                <i class="material-icons">check</i>
            `;

            acceptButton.addEventListener('click', async() => {
                const result = await requestFromServer({
                    url: '/account/accept-account',
                    method: 'POST',
                    body: {
                        username: account.username
                    }
                });

                if (result) {
                    card.parentNode.remove();
                }

                getVerifiedAccounts();
            });

            const rejectButton = document.createElement('button');
            rejectButton.classList.add('btn', 'btn-danger');

            rejectButton.innerHTML = `
                <i class="material-icons">close</i>
            `;

            rejectButton.addEventListener('click', async() => {
                const result = await requestFromServer({
                    url: '/account/reject-account',
                    method: 'POST',
                    body: {
                        username: account.username
                    }
                });

                if (result) {
                    card.parentNode.remove();
                }
            });

            cardFooter.append(acceptButton, rejectButton);
            cardBody.append(cardTitle, cardText);
            card.append(cardBody, cardFooter);
            col.append(card);
            pendingRequests.append(col);
        });
    }

    getPendingAccounts();


    const getVerifiedAccounts = async() => {
        const verifiedAccounts = await requestFromServer({
            url: '/account/get-verified-accounts',
            method: 'POST'
        });

        const verifiedAccountsTable = currentPage.querySelector('#st--verified-accounts-table');

        const headers = [{
            title: 'Username',
            getData: (row) => row.username || 'No username'
        }, {
            title: 'Name',
            getData: (row) => row.name || 'No name'
        }, {
            title: 'Email',
            getData: (row) => row.email || 'No email'
        }, {
            title: 'Roles',
            getData: (row) => {
                const roles = row.roles ? JSON.parse(row.roles) : [];

                const rolesContainer = document.createElement('div');
                roles.forEach(role => {
                    const roleBadge = document.createElement('span');
                    roleBadge.classList.add('badge', 'bg-primary', 'me-1');
                    roleBadge.innerHTML = role;

                    const roleRemovebutton = document.createElement('button');
                    roleRemovebutton.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-1');
                    roleRemovebutton.innerHTML = `
                        <i class="material-icons">close</i>
                    `;
                    roleRemovebutton.addEventListener('click', async() => {
                        const removeRole = await CustomBootstrap.confirm('Are you sure you want to remove this role?');
                        if (removeRole) {
                            await requestFromServer({
                                url: '/account/remove-role',
                                method: 'POST',
                                body: {
                                    username: row.username,
                                    role
                                }
                            });

                            getVerifiedAccounts();
                        }
                    });

                    roleBadge.append(roleRemovebutton);

                    rolesContainer.append(roleBadge);
                });

                const addRoleButton = document.createElement('button');
                addRoleButton.classList.add('btn', 'btn-success', 'btn-sm', 'ms-1');
                addRoleButton.innerHTML = `
                    <i class="material-icons">add</i>
                `;
                addRoleButton.addEventListener('click', async() => {
                    const role = await CustomBootstrap.modalSelect('Select role', allRoles.map(r => r.name));
                    if (role) {
                        await requestFromServer({
                            url: '/account/add-role',
                            method: 'POST',
                            body: {
                                username: row.username,
                                role
                            }
                        });

                        getVerifiedAccounts();
                    }
                });

                rolesContainer.append(addRoleButton);

                return rolesContainer;
            }
        }, {
            title: 'Actions',
            getData: (row) => {
                const btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group');

                const remove = document.createElement('button');
                remove.classList.add('btn', 'btn-danger');

                remove.innerHTML = `
                    <i class="material-icons">delete</i>
                `;

                remove.addEventListener('click', async() => {
                    const removeAccount = await CustomBootstrap.confirm('Are you sure you want to remove this account?');

                    if (removeAccount) {
                        await requestFromServer({
                            url: '/account/remove-account',
                            method: 'POST',
                            body: {
                                username: row.username
                            }
                        });

                        getVerifiedAccounts();
                    }
                });

                btnGroup.append(remove);

                const unVerify = document.createElement('button');
                unVerify.classList.add('btn', 'btn-warning');

                unVerify.innerHTML = `
                    <i class="material-icons">close</i>
                `;

                unVerify.addEventListener('click', async() => {
                    const unVerifyAccount = await CustomBootstrap.confirm('Are you sure you want to unverify this account?');

                    if (unVerifyAccount) {
                        await requestFromServer({
                            url: '/account/unverify-account',
                            method: 'POST',
                            body: {
                                username: row.username
                            }
                        });

                        getVerifiedAccounts();
                        getPendingAccounts();
                    }
                });

                btnGroup.append(unVerify);

                return btnGroup;
            }
        }];
        const table = new Table(verifiedAccountsTable, headers, verifiedAccounts);
    }

    getVerifiedAccounts();

    socket.on('pending-accounts', getPendingAccounts);
    socket.on('verified-accounts', getVerifiedAccounts);

    const { properties } = currentEvent;

    const { length } = properties.field;
    st_selectFieldOrientation.select(length === 1 ? properties.field[0] : 'normal');
    if (properties.hidePr) st_checkboxes.select('hide-practice-matches');

    const setEventProperties = async() => {        
        await requestFromServer({
            url: '/events/set-event-properties',
            method: 'POST',
            body: {
                properties: {
                    field: st_selectFieldOrientation.value.properties,
                    hidePr: st_checkboxes.isSelected('hide-practice-matches')
                },
                eventKey: currentEvent.info.key
            }
        });
    }

    document.querySelector('#st--save-event-properties').addEventListener('click', setEventProperties);


    return async() => {
        socket.off('pending-accounts', getPendingAccounts);
        socket.off('verified-accounts', getVerifiedAccounts);
        document.querySelector('#st--save-event-properties').removeEventListener('click', setEventProperties);
    }
}