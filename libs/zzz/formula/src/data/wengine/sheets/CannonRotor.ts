import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { customDmg, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'CannonRotor'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  ...customDmg(
    'damage',
    { damageType1: 'elemental' },
    cmpSpecialtyAndEquipped(
      key,
      prod(own.final.atk, subscript(modification, dm.dmg_scaling))
    ),
    { cond: showSpecialtyAndEquipped(key) },
    own.combat.crit_.add(1)
  ),
  registerBuff(
    'passive_atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(key, subscript(modification, dm.passive_atk_))
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
