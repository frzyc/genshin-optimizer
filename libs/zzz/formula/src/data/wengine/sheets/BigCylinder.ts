import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '@genshin-optimizer/zzz/stats'
import { customDmg, own } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BigCylinder'
const { modification } = own.wengine
const params = getWengineParams(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  ...customDmg(
    'damage',
    { damageType1: 'elemental' },
    cmpSpecialtyAndEquipped(
      key,
      prod(own.final.def, subscript(modification, params[1]))
    ),
    { cond: showSpecialtyAndEquipped(key) },
    own.initial.crit_.add(1)
  )
)
export default sheet
