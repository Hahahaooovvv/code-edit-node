import express from 'express';
import MongodbHelper from '../utils/mongoDBHelper';
import IDBUserInfo, { EUserRole } from '../interface/user/IDBUserInfo';
import jwt from 'jsonwebtoken';
import { secret } from '../app';
import moment from 'moment';

const UserRoute = express.Router();

/**用户登录 */
UserRoute.post('/login', (req, res) => {
    const { user_id, user_pwd } = req.body;
    if (!user_id || !user_pwd) {
        res.send({ code: 500, message: "未知错误" });
        return;
    }
    else if (!/^[A-Za-z0-9]{4,12}$/.test(user_id)) {
        res.send({ code: 500, message: "账号由4-12位数字和字母组成" });
        return;
    }
    else if (!/^[A-Za-z0-9]{4,12}$/.test(user_pwd)) {
        res.send({ code: 500, message: "密码由4-12位数字和字母组成" });
        return;
    }
    MongodbHelper.GetDBObject(res)
        .then(async db => {
            // 查询登录
            const userOne: IDBUserInfo | null = await db.collection('user').findOne({ user_id });
            db.close();
            if (userOne) {
                if (userOne.user_pwd === user_pwd) {
                    // 生成token
                    const token = 'Bearer ' + jwt.sign({
                        id: userOne.id
                    }, secret, {
                            // 过期时间 很多很多分钟
                            expiresIn: 1200000
                        })
                    // 登录成功
                    res.send({ code: 0, message: "登录成功", data: { token, user_id: userOne.id } });
                }
                else {
                    res.send({ code: 500, message: "账号或密码错误" });
                }
            }
            else {
                //  需要注册
                res.send({ code: 2, message: "用户不存在" });
            }
        })
});

UserRoute.post('/register', (req, res) => {
    const { user_id, user_pwd } = req.body;
    if (!user_id || !user_pwd) {
        res.send({ code: 500, message: "未知错误" });
        return;
    }
    else if (!/^[A-Za-z0-9]{4,12}$/.test(user_id)) {
        res.send({ code: 500, message: "账号由4-12位数字和字母组成" });
        return;
    }
    else if (!/^[A-Za-z0-9]{4,12}$/.test(user_pwd)) {
        res.send({ code: 500, message: "密码由4-12位数字和字母组成" });
        return;
    }

    MongodbHelper.GetDBObject(res)
        .then(async db => {
            // 查询登录
            const userOne: IDBUserInfo | null = await db.collection('user').findOne({ user_id });
            // db.close();
            if (!userOne) {
                const findLimit = ((await db.collection('user').find().sort({ id: -1 }).limit(1).toArray())[0] || { id: 100001 }).id + 1;
                // 生成token
                const token = 'Bearer ' + jwt.sign({
                    id: findLimit
                }, secret, {
                        // 过期时间 很多很多分钟
                        expiresIn: 1200000
                    });
                await db.collection('user').insert({
                    id: findLimit,
                    user_id,
                    user_pwd,
                    create_time: new Date(),
                    role: EUserRole.user
                } as IDBUserInfo);
                db.close();
                // 登录成功
                res.send({ code: 0, message: "注册成功", data: { token, user_id: findLimit } });
            }
            else {
                db.close();
                //  需要注册
                res.send({ code: 500, message: "用户名已被注册" });
            }
        })
})

export default UserRoute;