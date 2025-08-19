const express = require('express');
const app = express();
const {WebSocketServer} = require('ws');

const userMap = new Map();

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
    //  중복 닉네임
        const msg = JSON.parse(data);

        if(msg.code === '1'){
            const nickname = msg.sender;

            let isDuplicate = Array.from(userMap.values()).includes(nickname);
            if(isDuplicate){
            //     중복인 경우 중복이라고 알려주고 돌려보내기
                const errorMessage = {
                    code : '9',
                    content : '유효하지 않은 닉네임입니다.'
                };
                ws.send(JSON.stringify(errorMessage));
            } else {
                userMap.set(ws, nickname);
                const participantList = Array.from(userMap.values());
                const initialListMessage = {
                    code: '0',
                    content : JSON.stringify(participantList)
                };
                ws.send(JSON.stringify(initialListMessage));

                const joinMessage = {
                    code : '1',
                    sender: nickname,
                    content: '',
                    time: new Date().toLocaleString(),
                }
                wss.broadcast(JSON.stringify(joinMessage));
            }
        } else if(msg.code === '3'){
            wss.broadcast(JSON.stringify(msg));
        }
    })
    ws.on('close', () => {
        const nickname = userMap.get(ws);
        userMap.delete(ws);

        if(nickname){
            const leaveMessage = {
                code : '2',
                sender : nickname,
                content : '',
                time: new Date().toLocaleString()
            };
            wss.broadcast(JSON.stringify(leaveMessage));
        }
    })
})
