
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
    location?: Nullable<string>;
    lock: boolean;
    substats: InputSubstat[];
}

export interface InputSubstat {
    key: string;
    value: number;
}

export interface UpdateArtifact {
    setKey?: Nullable<string>;
    slotKey?: Nullable<string>;
    level?: Nullable<number>;
    rarity?: Nullable<number>;
    mainStatKey?: Nullable<string>;
    location?: Nullable<string>;
    lock?: Nullable<boolean>;
    substats?: Nullable<InputSubstat[]>;
    id: string;
}

export interface InputWeapon {
    key: string;
    level: number;
    ascension: number;
    refinement: number;
    location: string;
    lock: boolean;
}

export interface InputCharacter {
    key: string;
    level: number;
    ascension: number;
    constellation: number;
    talent: InputTalent;
}

export interface InputTalent {
    auto: number;
    skill: number;
    burst: number;
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
    location?: Nullable<string>;
    lock: boolean;
    substats: Substat[];
}

export interface Substat {
    key: string;
    value: number;
}

export interface Weapon {
    id: string;
    genshinUserId: string;
    key: string;
    level: number;
    ascension: number;
    refinement: number;
    location: string;
    lock: boolean;
}

export interface AddWeaponRes {
    success: boolean;
    weapon?: Nullable<Weapon>;
    error?: Nullable<string>;
}

export interface Talent {
    auto: number;
    skill: number;
    burst: number;
}

export interface Character {
    id: string;
    genshinUserId: string;
    key: string;
    level: number;
    ascension: number;
    constellation: number;
    talent: Talent;
}

export interface AddCharacterRes {
    success: boolean;
    character?: Nullable<Character>;
    error?: Nullable<string>;
}

export interface IQuery {
    getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;
    searchUsers(username: string): User[] | Promise<User[]>;
    getGenshinUser(id: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
    getGenshinUserByUid(uid: string): Nullable<GenshinUser> | Promise<Nullable<GenshinUser>>;
    getArtifact(id: string): Nullable<Artifact> | Promise<Nullable<Artifact>>;
    getAllUserArtifact(genshinUserId: string): Artifact[] | Promise<Artifact[]>;
    getWeapon(id: string): Nullable<Weapon> | Promise<Nullable<Weapon>>;
    getAllUserWeapon(genshinUserId: string): Weapon[] | Promise<Weapon[]>;
    getCharacter(id: string): Nullable<Character> | Promise<Nullable<Character>>;
    getAllUserCharacter(genshinUserId: string): Character[] | Promise<Character[]>;
}

export interface IMutation {
    createUsername(username: string): CreateUserNameResponse | Promise<CreateUserNameResponse>;
    addGenshinUser(uid: string): AddGenshinUserRes | Promise<AddGenshinUserRes>;
    addArtifact(genshinUserId: string, artifact: InputArtifact): Artifact | Promise<Artifact>;
    updateArtifact(genshinUserId: string, artifact: UpdateArtifact): Artifact | Promise<Artifact>;
    addWeapon(genshinUserId: string, weapon: InputWeapon): AddWeaponRes | Promise<AddWeaponRes>;
    addCharacter(genshinUserId: string, character: InputCharacter): AddCharacterRes | Promise<AddCharacterRes>;
}

type Nullable<T> = T | null;
