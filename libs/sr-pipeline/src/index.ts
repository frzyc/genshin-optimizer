import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDataGen } from './characterData'
import characterData from './characterData'
import LightConeData from './lightConeData'
import { main, sub } from './relic'

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

//dump relic data
dumpFile(`${path}/Relic/sub.json`, sub)
dumpFile(`${path}/Relic/main.json`, main)

export type { CharacterDataGen }

const allStat = {
  char: characterDataDump,
  lightcone: lightConeDataDump,
  relic: {
    sub,
    main,
  },
} as const

export type AllStats = typeof allStat

dumpFile(
  `${process.env['NX_WORKSPACE_ROOT']}/libs/sr-stats/src/allStat_gen.json`,
  allStat
)
