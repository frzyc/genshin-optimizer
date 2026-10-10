import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SurfsUp'
const normal_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 4)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(
    prod(stacks, percent(subscript(refinement, normal_dmg_arr)))
  )
)
