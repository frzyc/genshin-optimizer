import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ProspectorsShovel'
const electrocharged_dmg_arr = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const lunarcharged_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const gleam_lunarcharged_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.electrocharged.add(
    percent(subscript(refinement, electrocharged_dmg_arr))
  ),
  ownBuff.premod.dmg_.lunarcharged.add(
    percent(subscript(refinement, lunarcharged_dmg_arr))
  ),
  ownBuff.premod.dmg_.lunarcharged.add(
    cmpGE(
      team.common.moonsign,
      2,
      percent(subscript(refinement, gleam_lunarcharged_dmg_arr))
    )
  )
)
