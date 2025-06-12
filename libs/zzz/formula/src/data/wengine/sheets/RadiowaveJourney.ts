import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'RadiowaveJourney'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { launchingChainOrUlt } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'launchingChainOrUlt_sheerForce',
    ownBuff.combat.sheerForce.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(launchingChainOrUlt, subscript(phase, dm.sheerForce))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
