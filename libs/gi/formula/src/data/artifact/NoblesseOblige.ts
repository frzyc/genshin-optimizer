import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, percent, selfBuff, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NoblesseOblige',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  selfBuff.premod.dmg_.burst.add(cmpGE(count, 2, percent(0.2))),
  teamBuff.premod.atk_.addOnce(set4.ifOn(cmpGE(count, 4, percent(0.2))))
)
