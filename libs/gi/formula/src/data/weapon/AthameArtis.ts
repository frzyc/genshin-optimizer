import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  cmpGE,
  cmpNE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AthameArtis'
const burstCritDmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const self_atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const team_atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { burstHit } = allBoolConditionals(key)
const burstHit_selfAtk_ = burstHit.ifOn(
  percent(subscript(refinement, self_atk_arr))
)
const burstHit_teamAtk_ = burstHit.ifOn(
  percent(subscript(refinement, team_atk_arr))
)
const hexerei_selfAtk_ = cmpGE(
  team.common.hexerei,
  2,
  prod(percent(0.75), burstHit_selfAtk_)
)
const hexerei_teamAtk_ = cmpGE(
  team.common.hexerei,
  2,
  prod(percent(0.75), burstHit_teamAtk_)
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critDMG_.burst.add(
    percent(subscript(refinement, burstCritDmg_arr))
  ),
  ownBuff.premod.atk_.add(sum(burstHit_selfAtk_, hexerei_selfAtk_)),
  // WR: dest is on-field AND dest !== wielder (off-field wielder buffs on-fielder).
  notOwnBuff.premod.atk_.add(
    cmpNE(destIsActive, 0, sum(burstHit_teamAtk_, hexerei_teamAtk_))
  )
)
