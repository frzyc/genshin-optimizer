import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import * as allStat_gen from './allStat_gen.json'
import type { AllStats } from './executors/gen-stats/executor'

// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
export type {
  CharacterDataGen,
  WeaponData,
  WeaponDataGen,
} from './executors/gen-stats/executor'

const allStats = allStat_gen as AllStats

export { allStats }

export function getCharEle(ck: CharacterKey) {
  switch (ck) {
    case 'TravelerAnemo':
      return 'anemo'
    case 'TravelerGeo':
      return 'geo'
    case 'TravelerElectro':
      return 'electro'
    case 'TravelerDendro':
      return 'dendro'
    case 'TravelerHydro':
      return 'hydro'
    default:
      return allStats.char.data[ck].ele
  }
}

export function getCharData(ck: CharacterKey) {
  const locCharKey = charKeyToLocCharKey(ck)
  return allStats.char.data[locCharKey]
}
