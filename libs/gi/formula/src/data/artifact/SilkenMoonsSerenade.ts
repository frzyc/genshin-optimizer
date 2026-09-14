import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
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

const key: ArtifactSetKey = 'SilkenMoonsSerenade'
const count = artCount(key)
const { '4GleamingMoon': gleamingMoon } = allBoolConditionals(key)

const gleamOn = gleamingMoon.ifOn(cmpGE(count, 4, 1))
const { entries: gleamStack, out: gleamOut } = stackToken(
  'gleamingmoondevotion',
  gleamOn
)
const gleamEleMas = cmpGE(
  team.common.moonsign,
  2,
  120,
  cmpGE(team.common.moonsign, 1, 60)
)
const gleamLunar = percent(0.1)

export default registerArt(
  key,
  ownBuff.premod.enerRech_.add(cmpGE(count, 2, percent(0.2))),
  gleamStack,
  teamBuff.premod.eleMas.add(prod(gleamOut, gleamEleMas)),
  teamBuff.premod.dmg_.lunarcharged.add(prod(gleamOut, gleamLunar)),
  teamBuff.premod.dmg_.lunarbloom.add(prod(gleamOut, gleamLunar)),
  teamBuff.premod.dmg_.lunarcrystallize.add(prod(gleamOut, gleamLunar))
)
