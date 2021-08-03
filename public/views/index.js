let socket = io();

let memberList = document.getElementById('members');
let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');
let messagesContainer = document.getElementById('messages-container');
let typingNotification = document.getElementById('typing');

let currentUser;
let typingCount = 0;
let members = [];
let rooms = [];

window.onload = function () {
    let name = prompt('Enter your name:');
    socket.emit('entered', name);
};

input.addEventListener('input', function (e) {

    //looks like typing count needs to go to the node since not shared across instances - not getting a
    if (!e.target.value || e.target.value == '') {
        typingNotification = document.getElementById('typing');
        if(typeof(typingNotification) == 'undefined' || typingNotification == null) return;
        typingCount --;
        if (typingCount <= 0){
            typingCount = 0;
            messages.removeChild(typingNotification);
            currentUser.typing = false;
        }
    }
    else {
        if (currentUser.typing == false){
            if (typingCount == 0){
                let newTypingNotification = document.createElement('li');
                msg = {
                    type: 'notification',
                    sender: currentUser,
                    recicpient: '',
                    value: currentUser.name + ' is typing...'
                }
                socket.emit('chat message', msg);
                typingCount ++;
            }
            else{
                typingCount ++;
                typingNotification = document.getElementById('typing');
                typingNotification.textContent = typingCount + ' people are typing...';
            }
            currentUser.typing = true;
        }
    }
})

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        msg = {
            type: 'public',
            sender: currentUser,
            recicpient: '',
            value: input.value
        }
        socket.emit('chat message', msg);
        input.value = null;
    }
});

socket.on('current user', function (user) {
    if (!currentUser) currentUser = user;
});

socket.on('users', function (users) {
    members = users;
    while (memberList.firstChild) {
        memberList.removeChild(memberList.firstChild);
    }
    for (user of members){
        let member = document.createElement('li');
        member.textContent = user.name;
        memberList.append(member);
    }
});

socket.on('chat message', function (msg) {
    let item = document.createElement('li');
    addMessageTypeClass(item, msg);
    addOwnMessageClass(item, msg);
    messages.appendChild(item);
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        left: 0,
        behavior: 'smooth'
    });
})

function addMessageTypeClass(item, msg) {
    switch (msg.type) {
        case 'notification':
            item.textContent = msg.value;
            item.classList.add('notification');
            break;
        case 'private':
            item.textContent = msg.senderName + ' (private): ' + msg.value;
            item.classList.add('private');
            break;
        default:
            if (msg.sender == currentUser.id) {
                item.textContent = msg.value;
                break;
            }
            item.textContent = msg.senderName + ' :\n' + msg.value;
            break;
    }
    return item;
}

function addOwnMessageClass(item, msg) {
    if (msg.sender == currentUser.id && msg.type != 'notification') {
        item.classList.add('own');
    }
    return item;
}