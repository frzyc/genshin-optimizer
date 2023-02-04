import { execSync } from "child_process";
import * as fs from 'fs';
import * as path from 'path';

const projectDir = path.resolve(__dirname, "..")

if (fs.existsSync(`${projectDir}/GenshinData`)) {
  console.log(`${projectDir} exists. Fetching and reseting repo...`);
  execSync(`git fetch`, { cwd: `${projectDir}/GenshinData` })
  execSync(`git reset --hard origin/master`, { cwd: `${projectDir}/GenshinData` })
} else {
  console.log(`${projectDir}/GenshinData doesn't exist, cloning repo...`);
  execSync(`git clone https://gitlab.com/Dimbreath/gamedata.git --depth 1 GenshinData`, { cwd: projectDir })
}
