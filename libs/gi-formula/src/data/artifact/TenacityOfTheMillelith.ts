import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { cmpGE } from '@genshin-optimizer/pando'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  allStacks,
  percent,
  selfBuff,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'TenacityOfTheMillelith'
const count = artCount(key)
// TODO: Conditionals
const { someBoolConditional } = allBoolConditionals(key)
const { _someListConditional } = allListConditionals(key, [])
const { _someNumConditional } = allNumConditionals(key, 'unique', false)
// TODO: Non-stack values
const { someStack } = allStacks(key)

export default registerArt(
  key,

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  // - Add enemy debuff using `enemyDebuff.<debuff target>.add(<debuff value>)`
  //
  // Check for 2-set effect using `cmpGE(count, 2, ...)`
  selfBuff.premod.atk_.add(cmpGE(count, 2, percent(1))),
  // Check for 4-set effect using `cmpGE(count, 4, ...)`
  // Applies non-stacking teambuff
  someStack.add(someBoolConditional.ifOn(cmpGE(count, 4, 1))),
  teamBuff.premod.atk_.add(someStack.apply(percent(1)))
)
