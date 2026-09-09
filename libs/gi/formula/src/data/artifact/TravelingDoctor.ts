import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { customHeal, own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'TravelingDoctor',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.incHeal_.add(cmpGE(count, 2, percent(0.2))),
  customHeal('heal', prod(percent(0.2), own.final.hp), {
    cond: cmpGE(count, 4, 'infer', ''),
  })
)
