
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface GenshinUser {
    id: string;
    uid: string;
}

export interface AddGenshinUserRes {
    success: boolean;
    genshinUser?: Nullable<GenshinUser>;
    error?: Nullable<string>;
}

export interface CreateUserNameResponse {
    success: boolean;
    error?: Nullable<string>;
}

export interface User {
    id: string;
    username?: Nullable<string>;
    genshinUsers?: Nullable<GenshinUser[]>;
}

export interface IQuery {
    getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;
    searchUsers(username: string): User[] | Promise<User[]>;
    getGenshinUser(id: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
    getGenshinUserByUid(uid: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
}

export interface IMutation {
    createUsername(username: string): CreateUserNameResponse | Promise<CreateUserNameResponse>;
    addGenshinUser(uid: string): AddGenshinUserRes | Promise<AddGenshinUserRes>;
}

type Nullable<T> = T | null;
