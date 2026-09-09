import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Emberwell'
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const stellar_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { react, stellar } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(react.ifOn(percent(subscript(refinement, atk_arr)))),
  allStellarReactionKeys.map((k) =>
    ownBuff.premod.dmg_[k].add(
      stellar.ifOn(percent(subscript(refinement, stellar_dmg_arr)))
    )
  )
)
