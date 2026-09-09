import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SerenitysCall'
const hp_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const gleam_hp_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(percent(subscript(refinement, hp_arr))),
  ownBuff.premod.hp_.add(
    cmpGE(team.common.moonsign, 2, percent(subscript(refinement, gleam_hp_arr)))
  )
)
