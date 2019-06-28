import { Socket, Server } from "socket.io";

export default class SocketHelper {
    static SocketIo: Server;
    /**登陆之后 初始化socket */
    static IniSocket = () => {
        SocketHelper.SocketIo.on('connection', function (socket: Socket) {
            console.log("用户登入");
            socket.on('disconnect', function () {
                console.log('用户退出');
            });
            // 监听加入房间 传入房间ID
            socket.on('add_room', (params: { room_id: string }) => {
                console.log("已加入房间", params)
                socket.join(params.room_id);
            });
            // 监听退出房间 传入房间ID
            socket.on('out_room', (params: { room_id: string }) => {
                console.log("已退出房间", params)
                socket.leave(params.room_id);
            });
            // 监听代码更改
            socket.on('editCode', function (params: { room_id: string, msg: string }) {
                console.log('发送消息');
                socket.broadcast.to(params.room_id).emit('editCode', params.msg);
            });

        });
    }
}