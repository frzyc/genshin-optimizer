import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'Berserker',
  count = artCount(key)
// WR cond(key, 'hp') state `'70'`. document.teamBuff is UI-only.
const { hp } = allListConditionals(key, ['70'])

export default registerArt(
  key,
  ownBuff.premod.critRate_.add(cmpGE(count, 2, percent(0.12))),
  ownBuff.premod.critRate_.add(cmpGE(count, 4, percent(hp.map({ '70': 0.24 }))))
)
