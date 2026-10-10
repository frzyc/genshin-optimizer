import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'EmblemOfSeveredFate',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.enerRech_.add(cmpGE(count, 2, percent(0.2))),
  ownBuff.premod.dmg_.burst.add(
    cmpGE(
      count,
      4,
      min(percent(0.75), prod(percent(0.25), sum(1, own.final.enerRech_)))
    )
  )
)
