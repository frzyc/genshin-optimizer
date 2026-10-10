import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'DisasterAndRemorse'
const dmg_ = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { unforgivable, irreparable } = allBoolConditionals(key)

const dmgBonus = prod(
  sum(1, cmpGE(team.common.hexerei, 2, percent(0.75))),
  percent(subscript(refinement, dmg_))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(unforgivable.ifOn(dmgBonus)),
  ownBuff.premod.dmg_.charged.add(unforgivable.ifOn(dmgBonus)),
  ownBuff.premod.dmg_.skill.add(irreparable.ifOn(dmgBonus)),
  ownBuff.premod.dmg_.burst.add(irreparable.ifOn(dmgBonus))
)
