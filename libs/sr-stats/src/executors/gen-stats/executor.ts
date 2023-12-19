import type { GenStatsExecutorSchema } from './schema'
import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDataGen } from './src/characterData'
import characterData from './src/characterData'
import LightConeData from './src/lightConeData'
import { main, sub } from './src/relic'
import { workspaceRoot } from '@nx/devkit'

const proj_path = `${workspaceRoot}/libs/sr-stats`
const path = `${proj_path}/Data`
const characterDataDump = characterData()
const lightConeDataDump = LightConeData()

export type { CharacterDataGen }

const allStat = {
  char: characterDataDump,
  lightCone: lightConeDataDump,
  relic: {
    sub,
    main,
  },
} as const

export type AllStats = typeof allStat

export default async function runExecutor(_options: GenStatsExecutorSchema) {
  console.log(`Writing character data to ${path}/Characters`)
  Object.entries(characterDataDump).forEach(([key, data]) =>
    dumpFile(`${path}/Characters/${key}/data.json`, data)
  )

  console.log(`Writing lightCone data to ${path}/LightCone`)
  Object.entries(lightConeDataDump).forEach(([key, data]) =>
    dumpFile(`${path}/LightCone/${key}/data.json`, data)
  )

  console.log(`Writing relic data to ${path}/Relic`)
  dumpFile(`${path}/Relic/sub.json`, sub)
  dumpFile(`${path}/Relic/main.json`, main)

  console.log(`Writing combined data to ${proj_path}/src/allStat_gen.json`)
  dumpFile(`${proj_path}/src/allStat_gen.json`, allStat)

  return { success: true }
}
