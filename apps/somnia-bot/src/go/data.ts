import type { IArtifact, ICharacter, IGOOD, IWeapon } from '@genshin-optimizer/gi-good';
import * as path from 'path'
import * as fs from 'fs';
import { Attachment } from 'discord.js';
import { Calculator } from '@genshin-optimizer/gi-formula';
import { getcalculator } from './calc';

const datapath = path.join(process.cwd(), 'somnia-data');
if (!fs.existsSync(datapath)) fs.mkdir(datapath, ()=>{console.log("Could not make data folder")});

//TODO
type Userdata = IGOOD & {
    buildSettings : any[],
    character : any
}
const data : Record<string, Userdata> = {};

export async function storedata(user : string, attachment: Attachment) {
    if (attachment.size > 1000000) throw "File size too large.";
    try {
        const response = await fetch(attachment.url);
        const data = await(response.json());
        await fs.promises.writeFile(path.join(datapath, user+'.json'), JSON.stringify(data));
    }
    catch (e) {
        console.log(e);
        throw "Error downloading file";
    }
}

export function getuserdata(user : string) : Userdata {
    if (user in data) return data[user];
    try {data[user] = require(path.join(datapath, user+'.json'));}
    catch {throw "No user data.";}
    return data[user];
}

export function getchardata(user : string, charname : string) : any {
    if (!(user in data)) getuserdata(user);
    const char : any = {};
    char.name = charname;
    char.char = data[user].characters?.find(e => e.key === charname);
    if (char.char === undefined) throw `No character "${charname}".`;
    char.weapon = data[user].weapons?.find(e => e.location === charname);
    char.artifacts = data[user].artifacts?.filter(e => e.location === charname);
    char.target = data[user].buildSettings?.find(e => e.id === charname);
    char.calculator = getcalculator(char);
    data[user].character = char;
    console.log(char.name);
    return char;
}
