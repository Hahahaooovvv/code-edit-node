import mongodb from 'mongodb';
import express from 'express';

interface DbClient extends mongodb.Db {
    close: () => void
}

export default class MongodbHelper {
    /**
     * 获取一个mongdb的对象
     * @param connectDb 链接数据库
     */
    public static GetDBObject(response?: express.Response, connectDb = 'code_edit'): Promise<DbClient> {
        return new Promise((res, rej) => {
            mongodb.MongoClient.connect('mongodb://localhost:27017/code_edit', async (error, db) => {
                if (error) {
                    response && response.send({ code: 500, message: "服务器内部错误" })
                    rej("获取mongdb链接出错");
                }
                else {
                    var dbo = db.db(connectDb) as DbClient;
                    dbo.close = db.close;
                    res(dbo);
                }
            })
        })
    }
}