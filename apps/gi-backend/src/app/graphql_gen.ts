
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface CreateUserNameResponse {
    success: boolean;
    error?: Nullable<string>;
}

export interface User {
    id: string;
    username: string;
}

export interface IQuery {
    searchUsers(username: string): User | Promise<User>;
}

export interface IMutation {
    createUsername(username: string): CreateUserNameResponse | Promise<CreateUserNameResponse>;
}

type Nullable<T> = T | null;
