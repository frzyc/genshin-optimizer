import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'RetracingBolide',
  count = artCount(key)
const { state } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.shield_.add(cmpGE(count, 2, percent(0.35))),
  ownBuff.premod.dmg_.normal.add(state.ifOn(cmpGE(count, 4, percent(0.4)))),
  ownBuff.premod.dmg_.charged.add(state.ifOn(cmpGE(count, 4, percent(0.4))))
)
