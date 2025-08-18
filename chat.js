const ws = new WebSocket('ws://localhost:8001');
const message = document.querySelector('.input-box');
const sendBtn = document.querySelector('#btn-send');
const content = document.querySelector('.content');
let userName;

//username 받기
document.addEventListener('DOMContentLoaded', () => {
    ws.onopen = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if(userName && userName !== ''){
            userName = urlParams.get('username');
            sendMessage(userName);
        }
    }
    ws.onmessage = receiveMessage;
})

function sendMessage(name) {
    // const nickname = document.getElementById('nickname').value;
    const sendMessage = document.getElementById('message').value;
    const time = new Date().toLocaleString();
    const fullMessage = `
        <div class="user-thumb">
            <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=${name}" alt="user"/>
            <span class="user-name">${name}</span>
        </div>
        <div class="user-message">
            <div>
                ${sendMessage.replaceAll(/(\n|\r\n)/g, "<br>")}
                <span>${time}</span>
            </div>
        </div>
    `;

    ws.send(fullMessage);
    document.querySelector('#message').value = '';
    scrollToBottom(content);
}

function receiveMessage(event) {
    const chat = document.createElement("div");
    chat.className = 'chat-bubble left'
    chat.innerHTML = `${event.data}`

    const chatLog = document.getElementById('chat-log');
    chatLog.appendChild(chat);
}

// ws.onmessage = receiveMessage;

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