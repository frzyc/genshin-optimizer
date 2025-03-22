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

const key: WengineKey = 'TusksOfFury'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { interrupt_perfdodge } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),
  registerBuff(
    'passive_shield_',
    ownBuff.combat.shield_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.shield_))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    // TODO: teambuff
    'cond_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        interrupt_perfdodge.ifOn(subscript(phase, dm.dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
  // TODO: daze
)
export default sheet
