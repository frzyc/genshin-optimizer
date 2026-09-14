import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WhitelakeFrostfeather'
const atk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const stellar_critDMG_arr = [-1, 0.5, 0.65, 0.8, 0.95, 1.1]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(passive, percent(subscript(refinement, atk_arr)))
  ),
  allStellarReactionKeys.map((k) =>
    ownBuff.premod.critDMG_[k].add(
      cmpEq(passive, 3, percent(subscript(refinement, stellar_critDMG_arr)))
    )
  )
)
