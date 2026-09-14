import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'FlowerOfParadiseLost',
  count = artCount(key)
const { stacks } = allNumConditionals(key, true, 0, 4)

const bloom_dmg_ = cmpGE(
  count,
  4,
  sum(percent(0.4), prod(stacks, percent(0.1)))
)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  ownBuff.premod.dmg_.bloom.add(bloom_dmg_),
  ownBuff.premod.dmg_.hyperbloom.add(bloom_dmg_),
  ownBuff.premod.dmg_.burgeon.add(bloom_dmg_),
  ownBuff.premod.dmg_.lunarbloom.add(
    cmpGE(count, 4, sum(percent(0.1), prod(stacks, percent(0.025))))
  )
)
