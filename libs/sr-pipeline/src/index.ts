import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDatas, CharacterDataGen } from './characterData'
import characterData from './characterData'
import LightConeData, { LightConeDatas } from './lightConeData'

const path = `${process.env['NX_WORKSPACE_ROOT']}/libs/sr-stats/Data`
const characterDataDump = characterData()
//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([key, data]) =>
  dumpFile(`${path}/Characters/${key}/data.json`, data)
)

const lightConeDataDump = LightConeData()
//dump data file to respective lightcone directory.
Object.entries(lightConeDataDump).forEach(([key, data]) =>
  dumpFile(`${path}/LightCone/${key}/data.json`, data)
)

export type { CharacterDataGen }

const allStat = {
  char: characterDataDump,
  lightcone:lightConeDataDump
} as const

export type AllStats = typeof allStat

dumpFile(
  `${process.env['NX_WORKSPACE_ROOT']}/libs/sr-stats/src/allStat_gen.json`,
  allStat
)
