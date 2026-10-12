import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { cmpGE, cmpNE, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AstralVulturesCrimsonPlumage'
const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const charged_dmg_arr1 = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const charged_dmg_arr2 = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const burst_dmg_arr1 = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const burst_dmg_arr2 = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

const otherEleMembers = sum(
  ...allElementKeys.map((ele) =>
    cmpNE(own.char.ele, ele, team.common.count[ele])
  )
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    passive.ifOn(percent(subscript(refinement, atk_arr)))
  ),
  ownBuff.premod.dmg_.charged.add(
    percent(
      cmpGE(
        otherEleMembers,
        2,
        subscript(refinement, charged_dmg_arr2),
        cmpGE(otherEleMembers, 1, subscript(refinement, charged_dmg_arr1))
      )
    )
  ),
  ownBuff.premod.dmg_.burst.add(
    percent(
      cmpGE(
        otherEleMembers,
        2,
        subscript(refinement, burst_dmg_arr2),
        cmpGE(otherEleMembers, 1, subscript(refinement, burst_dmg_arr1))
      )
    )
  )
)
