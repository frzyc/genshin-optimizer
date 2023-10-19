import type { IArtifact, ICharacter, IGOOD, IWeapon } from '@genshin-optimizer/gi-good';
import * as path from 'path'
import * as fs from 'fs';
import { Attachment } from 'discord.js';

const datapath = path.join(process.cwd(), 'somnia-data');
if (!fs.existsSync(datapath)) fs.mkdir(datapath, ()=>{console.log("Could not make data folder")});

//TODO
type IGO = IGOOD & {buildSettings : any[]}
const data : Record<string, IGO> = {};

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

export function getchar(user : string, charname : string) : any {
  console.log(charname);
  const out : any = {};
  try {
    data[user] = require(path.join(datapath, user+'.json'));
  }
  catch {
    throw "No user data.";
  }
  out.char = data[user].characters?.find(e => e.key === charname);
  if (out.char === undefined) throw 0;
  out.weapon = data[user].weapons?.find(e => e.location === charname);
  out.artifacts = data[user].artifacts?.filter(e => e.location === charname);
  out.target = data[user].buildSettings?.find(e => e.id === charname);
  console.log(JSON.stringify(out.target.optimizationTarget));

  return out;
}
