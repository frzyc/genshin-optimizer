import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'SpringEmbrace'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { when_attacked } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // TODO: Dmg Reduction
  // Conditional buffs
  registerBuff(
    // TODO: teambuff
    'cond_enerRegen_',
    ownBuff.combat.enerRegen_.add(
      cmpSpecialtyAndEquipped(
        key,
        when_attacked.ifOn(subscript(phase, dm.enerRegen_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
