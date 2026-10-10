import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HaranGeppakuFutsu'
const passiveRefine = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const stack_normal_dmg_ = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { HonedFlow } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(percent(subscript(refinement, passiveRefine)))
  ),
  ownBuff.premod.dmg_.normal.add(
    prod(HonedFlow, percent(subscript(refinement, stack_normal_dmg_)))
  )
)
