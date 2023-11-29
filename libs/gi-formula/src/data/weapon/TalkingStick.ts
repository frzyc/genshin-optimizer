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

const src: WeaponKey = 'TalkingStick'

const {
  weapon: { refinement },
} = self
// TODO: Conditionals
const { someBoolConditional } = allBoolConditionals(src)
const { someListConditional } = allListConditionals(src, [])
const { someNumConditional } = allNumConditionals(src, 'unique', false)
// TODO: Non-stack values
const { someStack } = allStacks(src)

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
