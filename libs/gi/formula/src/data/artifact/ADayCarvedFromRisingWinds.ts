import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ADayCarvedFromRisingWinds',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.atk_.add(set4.ifOn(cmpGE(count, 4, percent(0.25)))),
  ownBuff.premod.critRate_.add(
    set4.ifOn(cmpGE(count, 4, cmpEq(own.common.hexerei, 1, percent(0.2))))
  )
)
