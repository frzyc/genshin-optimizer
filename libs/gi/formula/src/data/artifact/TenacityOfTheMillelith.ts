import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  ownBuff,
  percent,
  stackToken,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'TenacityOfTheMillelith'
const count = artCount(key)
const { skill } = allBoolConditionals(key)
const totmOn = skill.ifOn(cmpGE(count, 4, 1))
const { entries: totmStack, out: totmOut } = stackToken('totm4', totmOn)

export default registerArt(
  key,
  ownBuff.premod.hp_.add(cmpGE(count, 2, percent(0.2))),
  totmStack,
  teamBuff.premod.atk_.add(prod(totmOut, percent(0.2))),
  teamBuff.premod.shield_.add(prod(totmOut, percent(0.3)))
)
