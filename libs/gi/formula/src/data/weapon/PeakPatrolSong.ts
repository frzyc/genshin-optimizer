import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  stackToken,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PeakPatrolSong'
const def_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const self_ele_dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const ele_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  final,
  weapon: { refinement },
} = own
const { odeStacks } = allNumConditionals(key, true, 0, 2)
const { odeMaxed } = allBoolConditionals(key)
const odeStacks_ele_dmg_ = prod(
  odeStacks,
  percent(subscript(refinement, self_ele_dmg_arr))
)
const team_ele_dmg_ = prod(
  min(final.def, 3200),
  1 / 1000,
  percent(subscript(refinement, ele_dmg_arr))
)
const { entries: patrolStack, out: patrolOut } = stackToken(
  'patrol',
  odeMaxed.ifOn(1)
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.def_.add(
    prod(odeStacks, percent(subscript(refinement, def_arr)))
  ),
  allElementKeys.map((ele) => ownBuff.premod.dmg_[ele].add(odeStacks_ele_dmg_)),
  patrolStack,
  allElementKeys.map((ele) =>
    teamBuff.premod.dmg_[ele].add(prod(patrolOut, team_ele_dmg_))
  )
)
