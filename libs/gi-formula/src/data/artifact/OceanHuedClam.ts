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

const src: ArtifactSetKey = 'OceanHuedClam'
const count = artCount(src)
// TODO: Conditionals
const { someBoolConditional } = allBoolConditionals(src)
const { someListConditional } = allListConditionals(src, [])
const { someNumConditional } = allNumConditionals(src, 'unique', false)
// TODO: Non-stack values
const { someStack } = allStacks(src)

export default registerArt(
  src

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  // - Add enemy debuff using `enemyDebuff.<debugg target>.add(<debuff value>)`
  //
  // Check for 2-set effect using `cmpGE(count, 2, ...)`
  // Check for 4-set effect using `cmpGE(count, 4, ...)`
)
