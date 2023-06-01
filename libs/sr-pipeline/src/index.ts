import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDatas, CharacterDataGen } from './characterData'
import characterData from './characterData'

const path = `${process.env['NX_WORKSPACE_ROOT']}/libs/sr-stats/Data`
const characterDataDump = characterData()
//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([characterKey, data]) =>
  dumpFile(`${path}/Characters/${characterKey}/data.json`, data)
)

export type AllStats = {
  char: CharacterDatas
}
export type {
  CharacterDataGen
}

const allStat: AllStats = {
  char: characterDataDump,
}
dumpFile(
  `${process.env['NX_WORKSPACE_ROOT']}/libs/sr-stats/src/allStat_gen.json`,
  allStat
)
