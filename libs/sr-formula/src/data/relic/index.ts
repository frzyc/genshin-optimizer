import { allRelicSetKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import type { TagMapNodeEntries } from '../util'
import FirmamentFrontlineGlamoth from './FirmamentFrontlineGlamoth'
import PrisonerInDeepConfinement from './PrisonerInDeepConfinement'
import { entriesForRelic } from './util'

const data: TagMapNodeEntries = allRelicSetKeys.flatMap((key) => {
  switch (key) {
    case 'FirmamentFrontlineGlamoth':
      return FirmamentFrontlineGlamoth
    case 'PrisonerInDeepConfinement':
      return PrisonerInDeepConfinement
    default:
      return entriesForRelic(key, allStats.relic[key])
  }
})
export default data
