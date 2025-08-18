const express = require('express');
const app = express();
const {WebSocketServer} = require("ws");

// websocket server 8003
const socket = new WebSocketServer({ port: 8003 });
// server port 5000(listen을 통해 웹소켓과 포트 공유)
app.listen(5000);

app.use(express.static(__dirname));
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

socket.on('connection', (ws, req) => {
    ws.on('message', (msg) => {
        console.log(`메시지 ${msg}`);
    })
})