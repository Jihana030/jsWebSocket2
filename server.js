const express = require('express');
const app = express();
const {WebSocketServer} = require('ws');

app.use(express.static(__dirname));
app.listen(8000, ()=>{
    console.log("Server running on port 8000");
})

const wss = new WebSocketServer({port: 8001});
// 중복이 많아서 브로드캐스트 메소드 추가
wss.broadcast = (message) => {
    wss.clients.forEach((client) => {
        client.send(message);
    })
}

wss.on('connection', (ws, request) => {
    ws.on('message', (data) => {
        // wss.clients.forEach((client) => {
        //     client.send(data.toString()); //client에서 전송되는 데이터를 서버에서 Blob으로 수신하므로 스트링으로 변환.
        // })
        wss.broadcast(data.toString());
    })
    ws.on('close', () => {
        // wss.clients.forEach((client) => {
        //     client.send(`user leave. no:${wss.clients.size}`);
        // })
        const time = new Date().toLocaleString();
        wss.broadcast(`
            <div class="user-thumb">
                <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=system" alt="user"/>
                <span class="user-name">system</span>
            </div>
            <div class="user-message">
                <div>
                    유저가 퇴장했습니다.
                    <span>${time}</span>
                </div>
            </div>
        `);
    })
    // 유저 접속 시 모든 클라이언트에게 전달(= 브로드캐스트)
    wss.clients.forEach((client) => {
        const time = new Date().toLocaleString();
        client.send(`
            <div class="user-thumb">
                <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=system" alt="user"/>
                <span class="user-name">system</span>
            </div>
            <div class="user-message">
                <div>
                    새로운 유저가 입장했습니다. 총 ${wss.clients.size}명
                    <span>${time}</span>
                </div>
            </div>
        `);
        //clients는 리스트가 아닌 set이므로 size를 사용
        // wss.broadcast(`new user enter. no:${wss.clients.size}`); //브로드캐스트 만든 거 썼더니 중복메시지가 떠서 아웃
    })
})

// const express = require('express');
// const app = express();
// const {WebSocketServer} = require("ws");
//
// // websocket server 8003
// const socket = new WebSocketServer({ port: 8003 });
// // server port 5000(listen을 통해 웹소켓과 포트 공유)
// app.listen(5000);
//
// app.use(express.static(__dirname));
// app.get("/", function (req, res) {
//     res.sendFile(__dirname + '/chat.html');
// })
//
// socket.on('connection', (ws, req) => {
//     ws.on('message', (msg) => {
//         console.log(`메시지 ${msg}`);
//     })
// })