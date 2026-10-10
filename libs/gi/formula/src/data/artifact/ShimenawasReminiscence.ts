import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ShimenawasReminiscence',
  count = artCount(key)
const { usedEnergy } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.normal.add(
    usedEnergy.ifOn(cmpGE(count, 4, percent(0.5)))
  ),
  ownBuff.premod.dmg_.charged.add(
    usedEnergy.ifOn(cmpGE(count, 4, percent(0.5)))
  ),
  ownBuff.premod.dmg_.plunging.add(
    usedEnergy.ifOn(cmpGE(count, 4, percent(0.5)))
  )
)
