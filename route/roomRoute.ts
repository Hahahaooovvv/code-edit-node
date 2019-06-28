import express from 'express';
import MongodbHelper from '../utils/mongoDBHelper';
import IDBRoomInfo, { ERoomPublish } from '../interface/room/IDBRoomInfo';

const RoomRoute = express.Router();

RoomRoute.post('/create', (req, res) => {
    // 创建
    let { name, publish, language } = req.body;
    if (!/^[\u4E00-\u9FA5A-Za-z0-9_]{2,8}$/.test(name)) {
        res.send({ code: 500, message: "名称仅能输入2-8位中文、英文、数字包括下划线" });
        return;
    }
    else if (!publish || !language || !["0", "1"].includes(publish)) {
        res.send({ code: 500, message: "未知错误" });
        return;
    }
    publish = +publish;
    MongodbHelper.GetDBObject(res)
        .then(async db => {
            const roomOne = await db.collection('room').findOne({ name });
            if (roomOne) {
                res.send({ code: 500, message: "名称被占用" });
                db.close();
            }
            else {
                console.log((await db.collection('room').find().sort({ id: -1 }).limit(1).toArray()));
                const findLimit = ((await db.collection('room').find().sort({ id: -1 }).limit(1).toArray())[0] || { id: 100001 }).id + 1;
                const model = {
                    id: findLimit,
                    name,
                    create_time: new Date(),
                    publish: publish,
                    language,
                    user_db_id: +(req.headers.id as string),
                    code: "// 在这儿输入代码"
                } as IDBRoomInfo
                // 创建
                await db.collection('room').insert(model);
                db.close();
                res.send({
                    code: 0, message: "创建成功", data: model
                });
            }
        })
})

RoomRoute.post('/list', (req, res) => {
    let { name, query, pageNum, pageSize } = req.body;
    const queryObj: any = { publish: ERoomPublish.publish };
    if (name && name.trim().length !== 0) {
        const $or = [
            { name: { $regex: new RegExp(name) } },
            { id: +name }
        ]

        queryObj.$or = $or;
    }
    if (query && query + "" === "0") {
        queryObj.user_db_id = +(req.headers.id || 0);
    }
    pageNum = pageNum || 1;
    pageSize = pageSize || 5;
    console.log(queryObj)
    MongodbHelper.GetDBObject(res)
        .then(async db => {
            const room = await db.collection('room').find(queryObj).skip((pageNum - 1) * pageSize).limit(5).toArray();
            const count = await db.collection('room').find(queryObj).count();
            db.close();
            res.send({ code: 0, result: room, count });
        })
})

RoomRoute.post('/save', (req, res) => {
    let { code, room_id } = req.body;
    if (!code || !room_id) {
        res.send({ code: 500, message: "未知错误" });
        return;
    }
    MongodbHelper.GetDBObject(res)
        .then(async db => {
            const room: IDBRoomInfo | null = await db.collection('room').findOne({ id: +room_id });
            if (room && room.user_db_id === +(req.headers.id as string)) {
                // 可以修改
                room.code = code;
                await db.collection('room').save(room);
                res.send({ code: 0, message: "保存成功" });
                db.close();
            }
            else {
                res.send({ code: 500, message: "无权限修改" });
                db.close();
            }
        })
})


export default RoomRoute;