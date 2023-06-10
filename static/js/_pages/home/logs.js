mainFunctions.Logs = async() => {
    const serverLogsContainer = document.querySelector('#lg--server-logs');
    serverLogsContainer.innerHTML = '';
    const requestLogsContainer = document.querySelector('#lg--request-logs');
    requestLogsContainer.innerHTML = '';

    const colors = Color.fromBootstrap('primary').compliment(11, true).random().colors.map(c => c.hsl.setLightness(0.5));

    const createServerLog = (serverLog) => {
        let {
            date,
            type,
            info,
            ip,
            user,
            log,
            isError
        } = serverLog;

        const row = document.createElement('tr');

        // set tooltip on row
        row.setAttribute('data-toggle', 'tooltip');
        row.setAttribute('data-placement', 'left');
        row.setAttribute('title', info);


        const createCell = (text, color) => {
            const cell = document.createElement('td');
            cell.innerText = text;
            cell.classList.add('px-2');
            cell.style.color = color;
            row.appendChild(cell);
        }

        [
            date === 'Date' ? date : timeSince(new Date(date)).string,
            type,
            ip,
            user,
            log
        ].forEach((text, i) => {
            createCell(text, colors[i]);
        });

        // createCell(date === 'Date' ? date : timeSince(new Date(date)).string, 'text-lime');
        // createCell(type, 'text-primary');
        // createCell(ip, 'text-info');
        // createCell(user, 'text-warning');
        // createCell(log, isError ? 'text-danger' : 'text-light');

        if (!serverLogsContainer.children.length) serverLogsContainer.appendChild(row);
        else {
            // insert before second child
            const { children } = serverLogsContainer;
            if (children.length > 1) serverLogsContainer.insertBefore(row, children[1]);
            else serverLogsContainer.appendChild(row);
        }
    }

    
    const intervals = [];

    let timeSinceId = 0;
    const createRequestLog = (requestLog) => {
        timeSinceId++
        const {
            date,
            ip,
            method,
            url,
            status,
            userAgent,
            responseTime,
            body,
            account,
            sessionId,
            roles
        } = requestLog;

        const row = document.createElement('tr');

        // set tooltip on row
        row.setAttribute('data-toggle', 'tooltip');
        row.setAttribute('data-placement', 'left');
        row.setAttribute('title', body);

        $(row).tooltip();


        const createCell = (text, color) => {
            const cell = document.createElement('td');
            cell.innerHTML = text;
            cell.classList.add('px-2');
            cell.style.color = color.toString();
            row.appendChild(cell);
        }

        [
            date === 'Time Since' ? date : timeSince(new Date(+date)).string,
            ip,
            method,
            url,
            status,
            userAgent,
            responseTime,
            account,
            sessionId,
            roles
        ].forEach((text, i) => {
            createCell(text, colors[i]);
        });

        // createCell(date === 'Time Since' ? date : timeSince(new Date(+date)).string, 'text-lime');
        // createCell(ip, 'text-info');
        // createCell(method, 'text-primary');
        // createCell(url, 'text-warning');
        // createCell(status, 'text-light');
        // createCell(userAgent, 'text-info');
        // createCell(responseTime, 'text-success');
        // createCell(account, 'text-warning');
        // createCell(sessionId, 'text-danger');
        // createCell(roles, 'text-primary');

        if (!requestLogsContainer.children.length) requestLogsContainer.appendChild(row);
        else {
            // insert before second child
            const { children } = requestLogsContainer;
            if (children.length > 1) requestLogsContainer.insertBefore(row, children[1]);
            else requestLogsContainer.appendChild(row);
        }
    }

    // create headers
    createServerLog({
        date: 'Date',
        type: 'Type',
        info: 'Info',
        ip: 'IP',
        user: 'Username',
        log: 'Log',
        isError: false
    });

    createRequestLog({
        date: 'Time Since',
        ip: 'IP',
        method: 'Method',
        url: 'URL',
        status: 'Status',
        userAgent: 'User Agent',
        responseTime: 'Response Time',
        body: 'Body',
        account: 'Account',
        sessionId: 'Session ID',
        roles: 'Roles'
    });

    let [serverLogs, requestLogs] = await multiRequest({
        url: '/api/logs/server-logs',
        method: 'POST'
    }, {
        url: '/api/logs/request-logs',
        method: 'POST'
    });

    serverLogs.forEach(createServerLog);
    socket.on('server-log', createServerLog);

    requestLogs.forEach(createRequestLog);
    socket.on('request-logs', (logs) => {
        logs.forEach(createRequestLog);
    });

    return async() => {
        socket.off('server-log', createServerLog);
        socket.off('request-logs', createRequestLog);
        intervals.forEach(clearInterval);
        requestLogsContainer.innerHTML = '';
        serverLogsContainer.innerHTML = '';
    };
}