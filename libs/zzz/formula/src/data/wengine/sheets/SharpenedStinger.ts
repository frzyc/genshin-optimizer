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

const key: WengineKey = 'SharpenedStinger'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { predatoryInstinct } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'physical_dmg_',
    ownBuff.combat.dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(predatoryInstinct, subscript(phase, dm.physical_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
  // TODO: add anomaly buildup rate
)
export default sheet
