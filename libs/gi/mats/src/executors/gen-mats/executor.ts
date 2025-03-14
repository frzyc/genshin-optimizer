import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { workspaceRoot } from '@nx/devkit'
import type { GenMatsExecutorSchema } from './schema'
import characterMatData from './src/characterMatData'

const proj_path = `${workspaceRoot}/libs/gi/mats`

const characterMatDump = characterMatData()

export default async function runExecutor(_options: GenMatsExecutorSchema) {
  console.log(
    `Writing character mat data to ${proj_path}/src/allCharacterMats_gen.json`,
  )
  dumpFile(`${proj_path}/src/allCharacterMats_gen.json`, characterMatDump)

  return { success: true }
}
