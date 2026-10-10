import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MistsplitterReforged'
const passiveRefine = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const stacksRefine = {
  '1': [-1, 0.08, 0.1, 0.12, 0.14, 0.16],
  '2': [-1, 0.16, 0.2, 0.24, 0.28, 0.32],
  '3': [-1, 0.28, 0.35, 0.42, 0.49, 0.56],
}
const emblemKeys = ['1', '2', '3'] as const

const {
  weapon: { refinement },
} = own
const { MistsplittersEmblem } = allListConditionals(key, [...emblemKeys])
const stacks_dmg_ = lookup(
  subscript(MistsplittersEmblem.value, ['', ...emblemKeys]),
  {
    '1': percent(subscript(refinement, stacksRefine['1'])),
    '2': percent(subscript(refinement, stacksRefine['2'])),
    '3': percent(subscript(refinement, stacksRefine['3'])),
  },
  0
)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(percent(subscript(refinement, passiveRefine)))
  ),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(cmpEq(own.char.ele, ele, stacks_dmg_))
  )
)
