import { dumpFile } from '@genshin-optimizer/pipeline'
import { workspaceRoot } from '@nx/devkit'
import type { GenStatsExecutorSchema } from './schema'
import type {
  CharacterDataGen,
  SkillTreeNodeBonusStat,
} from './src/characterData'
import CharacterData from './src/characterData'
import type { LightConeDataGen } from './src/lightConeData'
import LightConeData from './src/lightConeData'
import type { RelicSetDataGen } from './src/relicData'
import { RelicData } from './src/relicData'

const proj_path = `${workspaceRoot}/libs/sr-stats`
const path = `${proj_path}/Data`
const characterDataDump = CharacterData()
const lightConeDataDump = LightConeData()
const relicDataDump = RelicData()

export type {
  CharacterDataGen,
  LightConeDataGen,
  RelicSetDataGen,
  SkillTreeNodeBonusStat,
}

const allStat = {
  char: characterDataDump,
  lightCone: lightConeDataDump,
  relic: relicDataDump,
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
  Object.entries(relicDataDump).forEach(([key, data]) =>
    dumpFile(`${path}/Relic/${key}.json`, data)
  )

  console.log(`Writing combined data to ${proj_path}/src/allStat_gen.json`)
  dumpFile(`${proj_path}/src/allStat_gen.json`, allStat)

  return { success: true }
}
