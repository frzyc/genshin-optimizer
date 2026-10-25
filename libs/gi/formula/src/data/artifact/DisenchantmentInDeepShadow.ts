import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'DisenchantmentInDeepShadow',
  count = artCount(key)
const { state } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.superconduct.add(cmpGE(count, 4, percent(0.8))),
  ownBuff.premod.dmg_.stellarconduct.add(cmpGE(count, 4, percent(0.4))),
  ownBuff.premod.critRate_.add(state.ifOn(cmpGE(count, 4, percent(0.16))))
)
