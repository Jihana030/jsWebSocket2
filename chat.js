const ws = new WebSocket('ws://localhost:8001');

const message = document.querySelector('.input-box');
const sendBtn = document.querySelector('#btn-send');
const content = document.querySelector('.content');
let userName;
let participants = [];
let disConnectUser = false;
//참가자명단 상단에 표시
const userList = document.querySelector('.user-name');
const userRate = document.querySelector('.user-id');
function displayList(name){
    userList.textContent = name.join();
    userRate.textContent = `${name.length}명`;
}

const chatThumb = document.querySelector('.user-thumb img');

//username 받기
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    userName = urlParams.get('username');
    chatThumb.src = `https://api.dicebear.com/9.x/thumbs/svg?seed=${userName}`;
    connectUser(userName);
})

function connectUser(name){
    if(ws && ws.readyState === WebSocket.OPEN){
        return;
    }
    // ws = new WebSocket('ws://localhost:8001');
    ws.onopen = () => {
        let message = {
            code: '1',
            sender: name,
            content: '',
            time: new Date().toLocaleString()
        }
        ws.send(JSON.stringify(message));

    }
    // ws.onmessage = receiveMessage;
    ws.onmessage = (e) => {
        let message = JSON.parse(e.data);
        if(message.code === '9'){
            alert('유효하지 않은 닉네임');
            disConnectUser = true;
            window.location.href = '/index.html';
            return;
        } else if (message.code === '0'){
            participants = JSON.parse(message.content);
            displayList(participants);
        } else if(message.code === '1'){
            if(message.sender !== userName){
                participants.push(message.sender);
            }
            displayList(participants);
            print('[system]', `${message.sender}님이 입장하셨습니다.`, message.sender === name ? 'me' : 'other', 'state', message.time);
        } else if(message.code === '2'){
            participants = participants.filter(participant => participant !== message.sender);
            displayList(participants);
            print('[system]', `${message.sender}님이 퇴장하셨습니다.`, message.sender === name ? 'me' : 'other', 'state', message.time);
        } else if(message.code === '3'){
            print(message.sender, message.content, message.sender === name ? 'me' : 'other', 'msg', message.time);
        }
    }
}

// 퇴장 유저 서버에 전송
window.onbeforeunload = () => {
    if(!disConnectUser){
        disconnect(userName);
    }
}
function disconnect(name){
    if(ws && ws.readyState === WebSocket.OPEN){
        let message = {
            code: '2',
            sender: name,
            receiver: '',
            content: '',
            regdate: new Date().toLocaleString()
        };
        ws.send(JSON.stringify(message));
    }
}

// textarea 높이
message.addEventListener('input', e=>{
    autoHeight(message);
})
function autoHeight(input){
    input.style.height = 'auto';
    if(input.scrollHeight > 173){
        input.style.height = '174px';
    } else {
        input.style.height = `${input.scrollHeight}px`;
    }
}

function sendMessage(name){
    const messageContent = message.value;
    const time = new Date().toLocaleString();

    if(messageContent.trim() === ''){
        return;
    }

    const chatMessage = {
        code : '3',
        sender: name,
        content: messageContent,
        time : time
    }

    ws.send(JSON.stringify(chatMessage));
}

// 전송버튼
sendBtn.addEventListener("click", ()=>{
    sendMessage(userName);
    message.value = '';
    message.style.height = 'auto';
});

// enter event
message.addEventListener("keydown", (e)=>{
    if(e.key === 'Enter'){
        if(!e.shiftKey){
            e.preventDefault();
            sendBtn.click();
        }
    }
});

//스크롤 아래 고정
function scrollToBottom(content){
    content.scrollTop = content.scrollHeight;
}

// 대화창 내용
function print(name, msg, side, state, time){
    let user = `
        <div class="user-thumb">
            <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=${name}" alt="user">
            <span class="user-name">${name}</span>
        </div>
    `;
    let temp = `
        <div class="user-message">
            <div>
                ${msg.replaceAll(/(\n|\r\n)/g, "<br>")}
                <span>${time}</span>
            </div>
        </div>
    `;
    let temp2 = `
        <div>
            ${msg.replaceAll(/(\n|\r\n)/g, "<br>")}
            <span>${time}</span>
        </div>
    `
    if(side === 'me'){
        if(content.children.length !== 0 && content.lastElementChild.classList.contains('right')){
            const userMessage = content.lastElementChild.querySelector('.user-message');
            userMessage.innerHTML += temp2;
        } else {
            const chatMe = document.createElement('div')
            chatMe.className = 'chat-bubble right';
            chatMe.innerHTML = temp;
            content.appendChild(chatMe);
        }
    } else {
        if(content.children.length !== 0 && content.lastElementChild.classList.contains('left')){
            const userMessage = content.lastElementChild.querySelector('.user-message');
            const userThumb = content.lastElementChild.querySelector('.user-thumb');
            if(name !== userThumb.querySelector('.user-name').innerText){
                const chatMe = document.createElement('div')
                chatMe.className = 'chat-bubble left';
                chatMe.innerHTML += user;
                chatMe.innerHTML += temp;
                content.appendChild(chatMe);
            } else {
                userMessage.innerHTML += temp2;
            }
        } else {
            const chatMe = document.createElement('div')
            chatMe.className = 'chat-bubble left';
            chatMe.innerHTML += user;
            chatMe.innerHTML += temp;
            content.appendChild(chatMe);
        }
    }
    scrollToBottom(content);
}