import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'KagurasVerity'
const dmg_ = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { KaguraDance } = allNumConditionals(key, true, 0, 3)

const dmgInc = percent(subscript(refinement, dmg_))
const stacked_dmg_ = prod(KaguraDance, dmgInc)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(stacked_dmg_),
  ownBuff.premod.dmg_.stellarconduct.add(stacked_dmg_),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(cmpEq(KaguraDance, 3, dmgInc))
  )
)
