import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NymphsDream',
  count = artCount(key)
const { set4 } = allNumConditionals(key, true, 0, 3)

export default registerArt(
  key,
  ownBuff.premod.dmg_.hydro.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.atk_.add(
    cmpGE(count, 4, percent(subscript(set4, [0, 0.07, 0.16, 0.25])))
  ),
  ownBuff.premod.dmg_.hydro.add(
    cmpGE(count, 4, percent(subscript(set4, [0, 0.04, 0.09, 0.15])))
  )
)
