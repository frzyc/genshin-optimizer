import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'FragmentOfHarmonicWhimsy',
  count = artCount(key)
const { stacks } = allNumConditionals(key, true, 0, 3)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.add(cmpGE(count, 4, prod(stacks, percent(0.18))))
)
