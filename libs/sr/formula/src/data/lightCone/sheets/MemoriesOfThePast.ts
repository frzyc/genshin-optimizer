import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'MemoriesOfThePast'
const data_gen = allStats.lightCone[key]

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen)
)
export default sheet
