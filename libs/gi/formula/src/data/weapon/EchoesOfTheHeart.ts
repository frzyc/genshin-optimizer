import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EchoesOfTheHeart'
const eleMasArr = [-1, 60, 75, 90, 105, 120]
const stellar_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { react, stellar } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(react.ifOn(subscript(refinement, eleMasArr))),
  ...allStellarReactionKeys.map((k) =>
    ownBuff.premod.dmg_[k].add(
      stellar.ifOn(percent(subscript(refinement, stellar_dmg_arr)))
    )
  )
)
