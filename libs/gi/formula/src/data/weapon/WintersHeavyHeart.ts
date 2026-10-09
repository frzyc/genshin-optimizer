import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WintersHeavyHeart'
const normal_eleMasArr = [-1, 24, 30, 36, 42, 48]
const atk_arr = [-1, 0.048, 0.06, 0.072, 0.084, 0.096]
const stellar_eleMasArr = [-1, 20, 25, 30, 35, 40]
const stellar_dmg_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own
const { lockStellarRadianceSc } = allBoolConditionals(key)

const partyCryoElectro = sum(team.common.count.cryo, team.common.count.electro)

const normal_eleMas = prod(
  lockStellarRadianceSc.ifOff(1),
  team.common.count.cryo,
  subscript(refinement, normal_eleMasArr)
)
const atk_ = prod(
  lockStellarRadianceSc.ifOff(1),
  team.common.count.electro,
  percent(subscript(refinement, atk_arr))
)
const stellar_eleMas = prod(
  lockStellarRadianceSc.ifOn(1),
  partyCryoElectro,
  subscript(refinement, stellar_eleMasArr)
)
const stellar_dmg_ = prod(
  lockStellarRadianceSc.ifOn(1),
  partyCryoElectro,
  percent(subscript(refinement, stellar_dmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(sum(normal_eleMas, stellar_eleMas)),
  ownBuff.premod.atk_.add(atk_),
  ...allStellarReactionKeys.map((k) => ownBuff.premod.dmg_[k].add(stellar_dmg_))
)
