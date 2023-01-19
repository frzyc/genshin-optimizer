import { execSync } from "child_process";
import * as fs from 'fs';
import * as path from 'path';

const projectDir = path.resolve(__dirname, "..")

if (fs.existsSync(`${projectDir}/GenshinData`)) {
  console.log(`${projectDir} exists. pulling repo...`);
  execSync(`git reset --hard origin/master`, { cwd: `${projectDir}/GenshinData` })
} else {
  console.log(`${projectDir} doesn't exist, cloning repo...`);
  execSync(`git clone git@github.com:Dimbreath/GenshinData.git --depth 1`, { cwd: projectDir })
}
