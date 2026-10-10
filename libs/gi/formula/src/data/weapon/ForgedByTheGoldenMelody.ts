import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { cmpEq, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ForgedByTheGoldenMelody'
const atk_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const eleMasArr = [-1, 120, 150, 180, 210, 240]
const stellar_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const moveKeys = ['1', '2', '3'] as const

const {
  weapon: { refinement },
} = own
const { movement, contra } = allListConditionals(key, [...moveKeys])
const movementVal = subscript(movement.value, ['', ...moveKeys])
const contraVal = subscript(contra.value, ['', ...moveKeys])
const atk_ = percent(subscript(refinement, atk_arr))
const eleMas = subscript(refinement, eleMasArr)
const stellar_dmg_ = percent(subscript(refinement, stellar_dmg_arr))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(cmpEq(movementVal, '1', atk_)),
  ownBuff.premod.eleMas.add(cmpEq(movementVal, '2', eleMas)),
  ...allStellarReactionKeys.map((k) =>
    ownBuff.premod.dmg_[k].add(cmpEq(movementVal, '3', stellar_dmg_))
  ),
  ownBuff.premod.atk_.add(cmpEq(contraVal, '1', atk_)),
  ownBuff.premod.eleMas.add(cmpEq(contraVal, '2', eleMas)),
  ...allStellarReactionKeys.map((k) =>
    ownBuff.premod.dmg_[k].add(cmpEq(contraVal, '3', stellar_dmg_))
  )
)
