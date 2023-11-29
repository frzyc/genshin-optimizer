import type { WeaponKey } from '@genshin-optimizer/consts'
import {} from '@genshin-optimizer/pando'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  allStacks,
  register,
  self,
} from '../util'

const src: WeaponKey = 'PrototypeRancour'

const {
  weapon: { refinement: _refinement },
} = self
// TODO: Conditionals
const { _someBoolConditional } = allBoolConditionals(src)
const { _someListConditional } = allListConditionals(src, [])
const { _someNumConditional } = allNumConditionals(src, 'unique', false)
// TODO: Non-stack values
const { _someStack } = allStacks(src)

export default register(
  src

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  // - Add enemy debuff using `enemyDebuff.<debugg target>.add(<debuff value>)`
  //
  // TODO: Add refinement bonus
)
