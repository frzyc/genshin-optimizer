import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  ownBuff,
  percent,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'VermillionHereafter'
const count = artCount(key)
const { afterBurst } = allBoolConditionals(key)
const { stacks } = allNumConditionals(key, true, 0, 4)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.atk_.add(
    afterBurst.ifOn(
      cmpGE(count, 4, sum(percent(0.08), prod(stacks, percent(0.1))))
    )
  )
)
