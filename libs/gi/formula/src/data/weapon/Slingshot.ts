import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Slingshot'
const dmg_arr = [-1, 0.36, 0.42, 0.48, 0.54, 0.6]
const condPassiveStates = ['less', 'more'] as const

const {
  weapon: { refinement },
} = own
const { Slingshot } = allListConditionals(key, [...condPassiveStates])
const na_ca_dmg_ = lookup(
  subscript(Slingshot.value, ['', ...condPassiveStates]),
  {
    less: percent(subscript(refinement, dmg_arr)),
    more: percent(-0.1),
  },
  0
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(na_ca_dmg_),
  ownBuff.premod.dmg_.charged.add(na_ca_dmg_)
)
