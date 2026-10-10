import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'FinaleOfTheDeepGalleries',
  count = artCount(key)
const { '0EnergyNoNormal': energyNoNormal, '0EnergyNoBurst': energyNoBurst } =
  allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.cryo.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.normal.add(
    energyNoBurst.ifOn(cmpGE(count, 4, percent(0.6)))
  ),
  ownBuff.premod.dmg_.burst.add(
    energyNoNormal.ifOn(cmpGE(count, 4, percent(0.6)))
  )
)
