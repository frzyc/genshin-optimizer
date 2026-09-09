import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BlackmarrowLantern'
const bloom_dmg_arr = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const lunarbloom_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const gleam_lunarbloom_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.bloom.add(percent(subscript(refinement, bloom_dmg_arr))),
  ownBuff.premod.dmg_.lunarbloom.add(
    percent(subscript(refinement, lunarbloom_dmg_arr))
  ),
  ownBuff.premod.dmg_.lunarbloom.add(
    cmpGE(
      team.common.moonsign,
      2,
      percent(subscript(refinement, gleam_lunarbloom_dmg_arr))
    )
  )
)
