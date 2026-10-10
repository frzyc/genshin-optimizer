import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, sum } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent, team } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'AubadeOfMorningstarAndMoon',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

const set4Lunar = set4.ifOn(
  cmpGE(
    count,
    4,
    sum(percent(0.2), cmpGE(team.common.moonsign, 2, percent(0.4)))
  )
)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  ownBuff.premod.dmg_.lunarcharged.add(set4Lunar),
  ownBuff.premod.dmg_.lunarbloom.add(set4Lunar),
  ownBuff.premod.dmg_.lunarcrystallize.add(set4Lunar)
)
