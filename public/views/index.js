let socket = io();

let memberList = document.getElementById('members');
let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');
let messagesContainer = document.getElementById('messages-container');


let currentUser;
let typingCount = 0;
let members = [];
let rooms = [];
let typing = false;
let timeout;

window.onload = function () {
    socket.emit('entered', prompt('Enter your name:'));
};

input.onkeyup = function (event) {
    if (event.keyCode != 13){
        onKeyDownNotEnter();
    }
    else if(event.keyCode == 13) {
        clearTimeout(timeout);
        typing = false;
    }
};

form.onsubmit = function (e) {
    e.preventDefault();
    if (input.value) {
        msg = {
            type: 'public',
            sender: currentUser,
            recicpient: '',
            value: input.value
        }
        socket.emit('chat message', msg);
        socket.emit('typing', false);
        input.value = null;
    }
};

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
    removeOldTypingMessage(msg);
    addMessageTypeClass(item, msg);
    addSenderText(item, msg);
    addMessageText(item, msg);
    messages.appendChild(item);
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        left: 0,
        behavior: 'smooth'
    });
})

function removeOldTypingMessage(msg) {
    if (msg.type != 'typing') return;
    let typingNotification = document.getElementById('typing');
    if (typingNotification) {
        typingNotification.parentNode.removeChild(typingNotification);
    }
}

function addMessageTypeClass(item, msg) {
    switch (msg.type) {
        case 'notification':
            item.classList.add('notification');
            break;
        case 'typing':
            item.classList.add('notification');
            item.id = 'typing';
            break;
        case 'private':
            item.classList.add('private');
            break;
        default:
            if (msg.sender == currentUser.id) {
                item.classList.add('own');
                break;
            }
            break;
    }
    return item;
}

function addSenderText(item, msg) {
    if (!msg.senderName || msg.sender == currentUser.id) return;
    let senderName = document.createElement('div');
    senderName.classList.add('sender');
    senderName.innerHTML = msg.senderName;
    item.appendChild(senderName);
    return item;
}

function addMessageText(item, msg) {
    let messageText = document.createElement('div');
    messageText.classList.add('content');
    addMessageTypeClass(messageText, msg);
    messageText.innerHTML = msg.value;
    item.appendChild(messageText);
    return item;
}

function timeoutFunction(){
    typing = false;
    socket.emit('typing', false);
}     
  
function onKeyDownNotEnter(){
    if(typing == false) {
        typing = true;
        socket.emit('typing', true);
        timeout = setTimeout(timeoutFunction, 3000);
    } else {
        window.clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 3000);
    }
}