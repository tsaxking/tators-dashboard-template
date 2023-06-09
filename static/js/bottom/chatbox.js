const cb_chatBox = document.querySelector('#chatbox');
let cb_open = false;

let thisID = null;

cb_chatBox.querySelector('#chat-icon').addEventListener('click', () => {
    cb_chatBox.querySelector('.card-body').classList.toggle('d-none');
    cb_chatBox.querySelector('.card-footer').classList.toggle('d-none');
    cb_chatBox.querySelector('#chat-room').classList.toggle('d-none');
    cb_open = !cb_open;
    if (cb_open) cb_chatBox.querySelector('#chat-icon').innerText = 'arrow_drop_down';
    else cb_chatBox.querySelector('#chat-icon').innerText = 'arrow_drop_up';
});

cb_chatBox.querySelector('#chat-input').addEventListener('keyup', e => {
    switch (e.key) {
        case 'Enter':
            cb_sendChat();
            break;
        case 'Escape':
            cb_chatBox.querySelector('#chat-input').value = '';
            break;
        default:
            socket.emit('typing');
            break;
    }
});

cb_chatBox.querySelector('#chat-send').addEventListener('click', cb_sendChat);

function cb_sendChat() {
    if (!myAccount) {
        createNotification('Chat Room', 'You must be signed in to chat.', 'danger');
        return;
    }

    const msg = cb_chatBox.querySelector('#chat-input').value;
    if (msg.trim() == '') return;
    cb_chatBox.querySelector('#chat-input').value = '';

    // get time in 12 hour format
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const time = hours + ':' + minutes + ' ' + ampm;

    socket.emit('chat-message', {
        msg,
        time,
        id: thisID,
        room: cb_room,
        user: myAccount.username
    });

    const chat = cb_chatBox.querySelector('#chat-messages');

    let div = `
    <div>
        <div class="row m-0">
            <small class="ws-nowrap m-0 p-0">
                You
            </small>
        </div>
        <div class="row mb-1">
            <div class="col-4">
                <p class="ws-nowrap">
                    ${time}
                </p>
            </div>
            <div class="col-8 d-flex justify-content-end">
                <div class="card bg-primary text-white">
                    <div class="card-body px-2 py-1">
                        <p class="message m-0">${msg}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    div = createElementFromText(div);

    chat.appendChild(div);
}

const cb_messages = [];

let cb_unread = 0;

socket.on('chat-message', ({ msg, time, id, room, user }) => {
    cb_messages.push({ msg, time, id, room });

    if (id == thisID) return;
    if (room != cb_room) return;

    cb_unread++;

    const chat = cb_chatBox.querySelector('#chat-messages');
    let div = `
    <div>
        <div class="row m-0">
            <small class="ws-nowrap m-0 p-0">
                ${user}
            </small>
        </div>
        <div class="row mb-1">
            <div class="col-8">
                <div class="card bg-secondary text-white">
                    <div class="card-body px-2 py-1">
                        <p class="message m-0">${msg}</p>
                    </div>
                </div>
            </div>
            <div class="col-4 d-flex justify-content-end">
                <p class="ws-nowrap">
                    ${time}
                </p>
            </div>
        </div>
    </div>`;

    div = createElementFromText(div);

    chat.appendChild(div);

    const numChats = document.querySelector('#num-chats');

    numChats.innerText = cb_unread;
    numChats.classList.add('animate__animated', 'animate__flash');
    numChats.addEventListener('animationend', () => {
        numChats.classList.remove('animate__animated', 'animate__flash');
    });


    pushNotification('New message from ' + user, msg);
});


manualEvents.forEach(evt => {
    cb_chatBox.addEventListener(evt, () => {
        cb_unread = 0;
        document.querySelector('#num-chats').innerText = '';
    });
});

socket.on('typing', () => {});

let cb_room;
cb_chatBox.querySelector('#chat-room').addEventListener('change', () => {
    cb_room = cb_chatBox.querySelector('#chat-room').value;

    cb_chatBox.querySelector('#chat-messages').innerHTML = '';

    cb_messages.forEach(({ msg, time, id, room, user }) => {
        if (room != cb_room) return;

        const chat = cb_chatBox.querySelector('#chat-messages');
        let div;

        if (id == thisID) {
            div = `
                <div>
                    <div class="row m-0">
                        <small class="ws-nowrap m-0 p-0">
                            You
                        </small>
                    </div>
                    <div class="row mb-1">
                        <div class="col-4">
                            <p class="ws-nowrap">
                                ${time}
                            </p>
                        </div>
                        <div class="col-8 d-flex justify-content-end">
                            <div class="card bg-primary text-white">
                                <div class="card-body p-0 px-2 py-1">
                                    <p class="message m-0">${msg}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            div = `
                <div>
                    <div class="row m-0">
                        <small class="ws-nowrap m-0 p-0">
                            ${user}
                        </small>
                    </div>
                    <div class="row mb-1">
                        <div class="col-8">
                            <div class="card bg-secondary text-white">
                                <div class="card-body px-2 py-1">
                                    <p class="message m-0">${msg}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-4 d-flex justify-content-end">
                            <p class="ws-nowrap">
                                ${time}
                            </p>
                        </div>
                    </div>
                </div>`;
        }

        div = createElementFromText(div);
        chat.appendChild(div);
    });
});