import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'LongNightsOath',
  count = artCount(key)
const { stacks } = allNumConditionals(key, true, 0, 5)

export default registerArt(
  key,
  ownBuff.premod.dmg_.plunging.add(cmpGE(count, 2, percent(0.25))),
  ownBuff.premod.dmg_.plunging.add(cmpGE(count, 4, prod(stacks, percent(0.15))))
)
