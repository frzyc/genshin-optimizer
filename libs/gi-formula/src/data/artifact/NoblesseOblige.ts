import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { cmpGE } from '@genshin-optimizer/pando'
import {
  allBoolConditionals,
  allStacks,
  percent,
  selfBuff,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NoblesseOblige',
  count = artCount(key)
const { set4 } = allBoolConditionals(key),
  { canNO4 } = allStacks(key)

export default registerArt(
  key,
  selfBuff.premod.dmg_.burst.add(cmpGE(count, 2, percent(0.2))),

  canNO4.add(set4.ifOn(cmpGE(count, 4, 1))),
  teamBuff.premod.atk_.add(canNO4.apply(percent(0.2)))
)
