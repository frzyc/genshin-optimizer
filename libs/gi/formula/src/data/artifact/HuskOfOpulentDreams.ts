import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'HuskOfOpulentDreams',
  count = artCount(key)
const { stack } = allNumConditionals(key, true, 0, 4)

export default registerArt(
  key,
  ownBuff.premod.def_.add(cmpGE(count, 2, percent(0.3))),
  ownBuff.premod.def_.add(cmpGE(count, 4, prod(stack, percent(0.06)))),
  ownBuff.premod.dmg_.geo.add(cmpGE(count, 4, prod(stack, percent(0.06))))
)
