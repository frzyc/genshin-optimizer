import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { customDmg, own } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BigCylinder'
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
      prod(own.final.def, subscript(modification, dm.dmg_scaling))
    ),
    { cond: showSpecialtyAndEquipped(key) },
    own.initial.crit_.add(1)
  )
)
export default sheet
