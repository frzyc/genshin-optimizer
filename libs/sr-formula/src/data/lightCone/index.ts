import type { LightConeKey } from '@genshin-optimizer/sr-consts'
import { allLightConeKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { register, type TagMapNodeEntries } from '../util'
import { entriesForLightCone } from './util'

// Attach the base stats from the generated datamine
export function lightConeBaseStats(src: LightConeKey): TagMapNodeEntries {
  const dataGen = allStats.lightCone[src]
  return register(src, entriesForLightCone(dataGen))
}
const data: TagMapNodeEntries = allLightConeKeys.flatMap(lightConeBaseStats)
export default data
