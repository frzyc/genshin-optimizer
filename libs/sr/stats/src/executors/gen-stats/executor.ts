import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { workspaceRoot } from '@nx/devkit'
import type { GenStatsExecutorSchema } from './schema'
import type {
  CharacterDatum,
  SkillTreeNodeBonusStat,
} from './src/characterData'
import CharacterData from './src/characterData'
import type { LightConeDatum } from './src/lightConeData'
import LightConeData from './src/lightConeData'
import { MiscData } from './src/miscData'
import type { RelicSetDatum } from './src/relicData'
import { RelicData } from './src/relicData'

const proj_path = `${workspaceRoot}/libs/sr/stats`
const path = `${proj_path}/Data`
const characterDataDump = CharacterData()
const lightConeDataDump = LightConeData()
const relicDataDump = RelicData()
const miscDataDump = MiscData()

export type {
  CharacterDatum,
  LightConeDatum,
  RelicSetDatum,
  SkillTreeNodeBonusStat,
}

const allStat = {
  char: characterDataDump,
  lightCone: lightConeDataDump,
  relic: relicDataDump,
  misc: miscDataDump,
} as const

export type AllStats = typeof allStat

export default async function runExecutor(_options: GenStatsExecutorSchema) {
  console.log(`Writing character data to ${path}/Characters`)
  await Promise.all(
    Object.entries(characterDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/Characters/${key}.json`, data),
    ),
  )

  console.log(`Writing lightCone data to ${path}/LightCone`)
  await Promise.all(
    Object.entries(lightConeDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/LightCone/${key}.json`, data),
    ),
  )

  console.log(`Writing relic data to ${path}/Relic`)
  await Promise.all(
    Object.entries(relicDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/Relic/${key}.json`, data),
    ),
  )

  console.log(`Writing misc data to ${path}/misc`)
  await Promise.all(
    Object.entries(miscDataDump).map(([key, data]) =>
      dumpPrettyFile(`${path}/misc/${key}.json`, data),
    ),
  )

  console.log(`Writing combined data to ${proj_path}/src/allStat_gen.json`)
  await dumpPrettyFile(`${proj_path}/src/allStat_gen.json`, allStat)

  return { success: true }
}
