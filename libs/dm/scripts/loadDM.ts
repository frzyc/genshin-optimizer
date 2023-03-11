import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const projectDir = path.resolve(__dirname, '..')
const hashFilePath = `${projectDir}/version.hash`

if (fs.existsSync(`${projectDir}/GenshinData`)) {
  console.log(`${projectDir} exists. Fetching...`)
  execSync(`git fetch`, { cwd: `${projectDir}/GenshinData` })
  const curVersion =
    execSync(`git rev-parse origin/master`)?.toString() ?? 'ERR'
  const fileHash =
    (fs.existsSync(hashFilePath) &&
      fs.readFileSync(hashFilePath)?.toString()) ||
    ''
  if (!fileHash || curVersion !== fileHash) {
    console.log(`Resetting GenshinData to new version...`)
    fs.writeFileSync(hashFilePath, curVersion)
    execSync(`git reset --hard origin/master`, {
      cwd: `${projectDir}/GenshinData`,
    })
  }
} else {
  console.log(`${projectDir}/GenshinData doesn't exist, cloning repo...`)
  execSync(
    `git clone https://gitlab.com/Dimbreath/gamedata.git --depth 1 GenshinData`,
    { cwd: projectDir }
  )
}
