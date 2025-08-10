import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'PracticedPerfection'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { stacks } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),
  registerBuff(
    'anomMas',
    ownBuff.combat.anomMas.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.anomMas))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'stacks_phys_dmg_',
    ownBuff.combat.dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(stacks, percent(subscript(phase, dm.phys_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
