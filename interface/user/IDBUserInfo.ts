export default interface IDBUserInfo {
    id: number,
    user_id: string,
    user_pwd: string,
    create_time: Date,
    role: EUserRole
}

export enum EUserRole {
    /**管理员，但是并没有什么软用 */
    manage = 1,
    /**普通用户 */
    user = 2
}