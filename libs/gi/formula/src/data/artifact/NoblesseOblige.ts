import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NoblesseOblige',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.burst.add(cmpGE(count, 2, percent(0.2))),
  teamBuff.premod.atk_.addOnce(key, set4.ifOn(cmpGE(count, 4, percent(0.2)))),
)
