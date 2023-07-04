import type { CharacterKey } from '@genshin-optimizer/consts'
import type { AllStats } from '@genshin-optimizer/gi-pipeline'
import allStat_gen from './allStat_gen.json'
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
    default:
      return allStats.char.data[ck].ele
  }
}
