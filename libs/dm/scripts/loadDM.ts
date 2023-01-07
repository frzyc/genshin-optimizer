import * as fs from 'fs';
import { exec } from "child_process";
import * as path from 'path';

const projectDir = path.resolve(__dirname, "..")
fs.access(`${projectDir}/GenshinData`, (err) => {
  if (err) {//doesnt exist
    console.log("./GenshinData doesn't exist, cloning repo...");
    exec(`cd ${projectDir} && git clone https://github.com/dimbreath/GenshinData.git --depth 1`)
  } else {
    console.log("./GenshinData exists, updating repo...");
    exec(`cd ${projectDir}/GenshinData && git pull --depth 1`)
  }
})
