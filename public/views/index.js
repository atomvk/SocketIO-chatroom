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
    //looks like typing count needs to go to the node since not shared across instances - not getting a
    if (event.keyCode != 13){
        onKeyDownNotEnter();
    }
    else if(event.keyCode == 13) {
        //socket.emit('typing', false);
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
    addOwnMessageClass(item, msg);
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
            item.textContent = msg.value;
            item.classList.add('notification');
            break;
        case 'typing':
            item.textContent = msg.value;
            item.classList.add('notification');
            item.id = 'typing';
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
    if (msg.sender == currentUser.id) {
        item.classList.add('own');
    }
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
        setTimeout(timeoutFunction, 3000);
    } else {
        clearTimeout(timeout);
        setTimeout(timeoutFunction, 3000);
    }
}