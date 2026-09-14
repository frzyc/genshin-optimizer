import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'GoldenTroupe',
  count = artCount(key)
// WR `set4` is a user toggle (char off-field), not `isActive.ifOff`.
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.skill.add(cmpGE(count, 2, percent(0.2))),
  ownBuff.premod.dmg_.skill.add(cmpGE(count, 4, percent(0.25))),
  ownBuff.premod.dmg_.skill.add(set4.ifOn(cmpGE(count, 4, percent(0.25))))
)
