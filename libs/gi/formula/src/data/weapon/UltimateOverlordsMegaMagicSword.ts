import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  allStacks,
  register,
  self,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'UltimateOverlordsMegaMagicSword'

const {
  weapon: { refinement: _refinement },
} = self
// TODO: Conditionals
const { _someBoolConditional } = allBoolConditionals(key)
const { _someListConditional } = allListConditionals(key, [])
const { _someNumConditional } = allNumConditionals(key, 'unique', false)
// TODO: Non-stack values
const { _someStack } = allStacks(key)

export default register(
  key,
  entriesForWeapon(key)

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  // - Add enemy debuff using `enemyDebuff.<debuff target>.add(<debuff value>)`
  //
  // TODO: Add refinement bonus
)
