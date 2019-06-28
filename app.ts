import http from 'http';
import express from 'express';
import socketIo from 'socket.io';
import UserRoute from './route/userRoute';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import RoomRoute from './route/roomRoute';
import SocketHelper from './utils/socketHelper';

export const secret = 'code_edit';

const app = express();
// 解析 参数
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// 使用jwt
app.use(expressJwt({
    secret: secret
}).unless({
    path: ['/apis/user/login', '/apis/user/register']
}));
// jwt 拦截
app.use((err: any, req: express.Request, res: express.Response, next: () => void) => {
    console.log(req.url)
    //当token验证失败时会抛出如下错误
    if (err.name !== 'UnauthorizedError') {
        //这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
        res.send({ code: 401, message: '未登录' });
        return;
    }
    next();
});

app.use((req, res, next) => {
    var token = req.headers['authorization'];
    if (token) {
        jwt.verify(token.replace('Bearer ', ""), secret, (err: any, decoded: any) => {
            console.log(err, decoded)
            if (!err) {
                // 如果验证通过，在req中写入解密结果
                req.headers.id = decoded.id;
            }
            next();
        });
    }
    else {
        next();
    }
})

const httpServer = new http.Server(app);
const io = socketIo(httpServer);
SocketHelper.SocketIo = io;
SocketHelper.IniSocket();

// 用户路由
app.use('/apis/user', UserRoute);
app.use('/apis/room', RoomRoute);


httpServer.listen(3100, () => {
    console.log("黑会儿")
});




// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var path = require('path');

// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// io.on('connection', function (socket) {
//     console.log('a user connected');

//     socket.on('disconnect', function () {
//         console.log('user disconnected');
//     });

//     socket.on('chat message', function (msg) {
//         console.log('message: ' + msg);

//         io.emit('chat message', msg);
//     });

// });

// app.set('port', process.env.PORT || 3000);

// var server = http.listen(app.get('port'), function () {
//     console.log('start at port:' + server.address().port);
// });