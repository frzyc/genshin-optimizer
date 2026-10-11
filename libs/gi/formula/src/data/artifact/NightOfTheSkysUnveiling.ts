import {
  type ArtifactSetKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  ownBuff,
  percent,
  stackToken,
  team,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NightOfTheSkysUnveiling',
  count = artCount(key)
const { '4GleamingMoon': gleamingMoon } = allBoolConditionals(key)

const set4CritRate_ = gleamingMoon.ifOn(
  cmpGE(
    count,
    4,
    cmpGE(
      team.common.moonsign,
      2,
      percent(0.3),
      cmpGE(team.common.moonsign, 1, percent(0.15))
    )
  )
)
const gleamOn = gleamingMoon.ifOn(cmpGE(count, 4, 1))
const { entries: gleamStack, out: gleamOut } = stackToken(
  'gleamingmoonintent',
  gleamOn
)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  ownBuff.premod.critRate_.add(set4CritRate_),
  gleamStack,
  ...allLunarReactionKeys.map((k) =>
    teamBuff.premod.dmg_[k].add(prod(gleamOut, percent(0.1)))
  )
)
