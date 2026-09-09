import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  lookup,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  own,
  ownBuff,
  percent,
  team,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'GildedDreams',
  count = artCount(key)
const { passive } = allBoolConditionals(key)
const { overrideSame, overrideOther } = allListConditionals(key, [
  '0',
  '1',
  '2',
  '3',
])

const teamSameNum = lookup(
  own.char.ele,
  {
    anemo: team.common.count.anemo,
    geo: team.common.count.geo,
    electro: team.common.count.electro,
    hydro: team.common.count.hydro,
    pyro: team.common.count.pyro,
    cryo: team.common.count.cryo,
    dendro: team.common.count.dendro,
  },
  0
)
const autoSameNum = cmpGE(teamSameNum, 2, sum(teamSameNum, -1))
const autoOtherNum = sum(
  ...allElementKeys.map((ele) =>
    cmpGE(
      team.common.count[ele],
      1,
      cmpNE(own.char.ele, ele, team.common.count[ele])
    )
  )
)
const overrideSameNum = overrideSame.map({ '0': 0, '1': 1, '2': 2, '3': 3 }, -1)
const overrideOtherNum = overrideOther.map(
  { '0': 0, '1': 1, '2': 2, '3': 3 },
  -1
)
const sameNum = cmpEq(overrideSameNum, -1, autoSameNum, overrideSameNum)
const otherNum = cmpEq(overrideOtherNum, -1, autoOtherNum, overrideOtherNum)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  ownBuff.premod.atk_.add(
    cmpGE(count, 4, passive.ifOn(prod(percent(0.14), sameNum)))
  ),
  ownBuff.premod.eleMas.add(cmpGE(count, 4, passive.ifOn(prod(50, otherNum))))
)
