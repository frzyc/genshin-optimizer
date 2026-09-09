import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { isActive } from '../common/conds'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SymphonistOfScents'
const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const offField_atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const team_atk_arr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]

const {
  weapon: { refinement },
} = own
const { healing } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(percent(subscript(refinement, atk_arr))),
  ownBuff.premod.atk_.add(
    isActive.ifOff(percent(subscript(refinement, offField_atk_arr)))
  ),
  teamBuff.premod.atk_.add(
    healing.ifOn(percent(subscript(refinement, team_atk_arr)))
  )
)
