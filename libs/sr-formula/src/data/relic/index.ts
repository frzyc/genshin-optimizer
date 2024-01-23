import { allRelicSetKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import type { TagMapNodeEntries } from '../util'
import PrisonerInDeepConfinement from './PrisonerInDeepConfinement'
import { entriesForRelic } from './util'

const data: TagMapNodeEntries = allRelicSetKeys.flatMap((key) => {
  switch (key) {
    case 'PrisonerInDeepConfinement':
      return PrisonerInDeepConfinement
    default:
      return entriesForRelic(key, allStats.relic[key])
  }
})
export default data
