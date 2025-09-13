import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  own,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BlackmarrowLantern'

const {
  weapon: { refinement: _refinement },
} = own
// TODO: Conditionals
const { _someBoolConditional } = allBoolConditionals(key)
const { _someListConditional } = allListConditionals(key, [])
const { _someNumConditional } = allNumConditionals(key)

export default register(
  key,
  entriesForWeapon(key)

  // TODO:
  // - Add member's own formulas using `ownBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add enemy debuff using `enemyDebuff.<debuff target>.add(<debuff value>)`
  //
  // TODO: Add refinement bonus
)
