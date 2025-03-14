import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  ownBuff,
  percent,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ResolutionOfSojourner'
const count = artCount(key)
// TODO: Conditionals
const { someBoolConditional } = allBoolConditionals(key)
const { _someListConditional } = allListConditionals(key, [])
const { _someNumConditional } = allNumConditionals(key)

export default registerArt(
  key,

  // TODO:
  // - Add member's own formulas using `ownBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add enemy debuff using `enemyDebuff.<debuff target>.add(<debuff value>)`
  //
  // Check for 2-set effect using `cmpGE(count, 2, ...)`
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(1))),
  // Check for 4-set effect using `cmpGE(count, 4, ...)`
  // Applies non-stacking teambuff
  teamBuff.premod.atk_.addOnce(
    key,
    someBoolConditional.ifOn(cmpGE(count, 4, percent(1))),
  ),
)
