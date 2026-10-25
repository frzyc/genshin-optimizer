import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'MarechausseeHunter',
  count = artCount(key)
const { set4 } = allNumConditionals(key, true, 0, 3)

export default registerArt(
  key,
  ownBuff.premod.dmg_.normal.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.charged.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.critRate_.add(cmpGE(count, 4, prod(set4, percent(0.12))))
)
