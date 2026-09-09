import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'VourukashasGlow',
  count = artCount(key)
const { set4 } = allNumConditionals(key, true, 0, 5)

export default registerArt(
  key,
  ownBuff.premod.hp_.add(cmpGE(count, 2, percent(0.2))),
  ownBuff.premod.dmg_.skill.add(
    cmpGE(count, 4, sum(percent(0.1), prod(set4, percent(0.08))))
  ),
  ownBuff.premod.dmg_.burst.add(
    cmpGE(count, 4, sum(percent(0.1), prod(set4, percent(0.08))))
  )
)
