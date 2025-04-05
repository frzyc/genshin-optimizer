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

const key: WengineKey = 'BigCylinder'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_dmg_red_',
    ownBuff.combat.dmg_red_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.dmg_red_))
    ),
    showSpecialtyAndEquipped(key)
  ),
  ...customDmg(
    'damage',
    { damageType1: 'elemental' },
    cmpSpecialtyAndEquipped(
      key,
      prod(own.final.def, subscript(phase, dm.dmg_scaling))
    ),
    { cond: showSpecialtyAndEquipped(key) },
    ownBuff.combat.crit_.add(1)
  )
)
export default sheet
