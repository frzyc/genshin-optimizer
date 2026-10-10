import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { customDmg, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'OceanHuedClam',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.heal_.add(cmpGE(count, 2, percent(0.15))),
  // WR display is 0.9*30000 * physical_resMulti_. Pando inDmg already applies RES.
  customDmg('foam', 'physical', 'elemental', prod(percent(0.9), 30000), {
    cond: cmpGE(count, 4, 'infer', ''),
  })
)
