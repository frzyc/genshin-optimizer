import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MappaMare'
const dmgBonus = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { InfusionScroll } = allNumConditionals(key, true, 0, 2)

const eleDmgInc = prod(InfusionScroll, percent(subscript(refinement, dmgBonus)))

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) => ownBuff.premod.dmg_[ele].add(eleDmgInc))
)
