import * as fs from 'fs';
import { execSync } from "child_process";
import * as path from 'path';

const projectDir = path.resolve(__dirname, "..")

if (fs.existsSync(`${projectDir}/GenshinData`)) {
  if (execSync(`cd ${projectDir}/GenshinData && git fetch --dry-run`).toString()) {
    console.log("./GenshinData exists & needs update, updating repo...");
    execSync(`cd ${projectDir}/GenshinData && git pull --depth 1`)
  } else
    console.log("./GenshinData exists & doesn't need update");
} else {
  console.log("./GenshinData doesn't exist, cloning repo...");
  execSync(`cd ${projectDir} && git clone https://github.com/dimbreath/GenshinData.git --depth 1`)
}
