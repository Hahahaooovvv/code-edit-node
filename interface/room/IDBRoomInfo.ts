export default interface IDBRoomInfo {
    id: number,
    name: string,
    create_time: Date,
    publish: ERoomPublish,
    /**语言 */
    language: string,
    user_db_id: number,
    code: string
}


export enum ERoomPublish {
    publish = 0,
    private = 1
}