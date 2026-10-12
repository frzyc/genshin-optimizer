import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'GestOfTheMightyWolf'
const dmg_arr = [-1, 0.075, 0.095, 0.115, 0.135, 0.155]
const critDMG_arr = [-1, 0.075, 0.095, 0.115, 0.135, 0.155]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 4)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    prod(stacks, percent(subscript(refinement, dmg_arr)))
  ),
  ownBuff.premod.critDMG_.add(
    cmpGE(
      team.common.hexerei,
      2,
      prod(stacks, percent(subscript(refinement, critDMG_arr)))
    )
  )
)
