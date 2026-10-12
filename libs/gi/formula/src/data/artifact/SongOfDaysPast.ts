import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'SongOfDaysPast'
const count = artCount(key)
const healingArr = range(1000, 15000, 1000).map(String)
const { healing } = allListConditionals(key, healingArr)
const dmgInc = cmpGE(
  count,
  4,
  healing.map(objKeyMap(healingArr, (healAmt) => Number(healAmt) * 0.08))
)

export default registerArt(
  key,
  ownBuff.premod.heal_.add(cmpGE(count, 2, percent(0.15))),
  teamBuff.formula.base.normal.add(dmgInc),
  teamBuff.formula.base.charged.add(dmgInc),
  teamBuff.formula.base.plunging.add(dmgInc),
  teamBuff.formula.base.skill.add(dmgInc),
  teamBuff.formula.base.burst.add(dmgInc)
)
