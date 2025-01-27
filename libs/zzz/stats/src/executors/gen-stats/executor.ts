import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { workspaceRoot } from '@nx/devkit'
import type { GenStatsExecutorSchema } from './schema'
import { characterData } from './src/characterData'
import { WengineData } from './src/wengineData'

const proj_path = `${workspaceRoot}/libs/zzz/stats`
const path = `${proj_path}/Data`
const characterDataDump = characterData()
const wengineDataDump = WengineData()

const allStat = {
  char: characterDataDump,
  wengine: wengineDataDump,
} as const

export type AllStats = typeof allStat

export default async function runExecutor(_options: GenStatsExecutorSchema) {
  console.log('Generating ZZZ stats')
  console.log(`Writing character data to ${path}/Characters`)
  await Promise.all(
    Object.entries(characterDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/Characters/${key}.json`, data)
    )
  )

  console.log(`Writing wengine data to ${path}/Wengine`)
  await Promise.all(
    Object.entries(wengineDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/Wengine/${key}.json`, data)
    )
  )

  console.log(`Writing combined data to ${proj_path}/src/allStat_gen.json`)
  await dumpPrettyFile(`${proj_path}/src/allStat_gen.json`, allStat)

  return { success: true }
}
