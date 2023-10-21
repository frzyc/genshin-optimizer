
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface InputArtifact {
    setKey: string;
    slotKey: string;
    level: number;
    rarity: number;
    mainStatKey: string;
    location: string;
    lock: boolean;
    substats: InputSubstat[];
}

export interface InputSubstat {
    key: string;
    value: number;
}

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

export interface Artifact {
    id: string;
    genshinUserId: string;
    setKey: string;
    slotKey: string;
    level: number;
    rarity: number;
    mainStatKey: string;
    location: string;
    lock: boolean;
    substats: Substat[];
}

export interface Substat {
    key: string;
    value: number;
}

export interface AddArtifactRes {
    success: boolean;
    artifact?: Nullable<Artifact>;
    error?: Nullable<string>;
}

export interface IQuery {
    getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;
    searchUsers(username: string): User[] | Promise<User[]>;
    getGenshinUser(id: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
    getGenshinUserByUid(uid: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
    getArtifact(id: string): Nullable<Artifact> | Promise<Nullable<Artifact>>;
    getAllUserArtifact(genshinUserId: string): Artifact[] | Promise<Artifact[]>;
}

export interface IMutation {
    createUsername(username: string): CreateUserNameResponse | Promise<CreateUserNameResponse>;
    addGenshinUser(uid: string): AddGenshinUserRes | Promise<AddGenshinUserRes>;
    addArtifact(genshinUserId: string, artifact: InputArtifact): AddArtifactRes | Promise<AddArtifactRes>;
}

type Nullable<T> = T | null;
