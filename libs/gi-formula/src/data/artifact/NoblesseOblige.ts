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

const name: ArtifactSetKey = 'NoblesseOblige',
  count = artCount(name)
const { set4 } = allBoolConditionals(name),
  { canNO4 } = allStacks(name)

export default registerArt(
  name,
  selfBuff.premod.dmg_.burst.add(cmpGE(count, 2, percent(0.2))),

  canNO4.add(set4.ifOn(cmpGE(count, 4, 1))),
  teamBuff.premod.atk_.add(canNO4.apply(percent(0.2)))
)
