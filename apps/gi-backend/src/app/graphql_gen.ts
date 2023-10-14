
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface Set {
    id: number;
    name?: Nullable<string>;
    year?: Nullable<number>;
    numParts?: Nullable<number>;
}

export interface IQuery {
    allSets(): Nullable<Nullable<Set>[]> | Promise<Nullable<Nullable<Set>[]>>;
    searchUsers(username?: Nullable<string>): Nullable<Nullable<User>[]> | Promise<Nullable<Nullable<User>[]>>;
}

export interface IMutation {
    addSet(name?: Nullable<string>, year?: Nullable<string>, numParts?: Nullable<number>): Nullable<Set> | Promise<Nullable<Set>>;
    createUsername(username: string): Nullable<CreateUserNameResponse> | Promise<Nullable<CreateUserNameResponse>>;
}

export interface User {
    id?: Nullable<string>;
    username?: Nullable<string>;
}

export interface CreateUserNameResponse {
    success?: Nullable<boolean>;
    error?: Nullable<string>;
}

type Nullable<T> = T | null;
