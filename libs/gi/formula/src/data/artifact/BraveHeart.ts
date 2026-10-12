import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'BraveHeart',
  count = artCount(key)
const { hp } = allListConditionals(key, ['50'])

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.add(cmpEq(hp.value, 1, cmpGE(count, 4, percent(0.3))))
)
