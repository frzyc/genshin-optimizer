import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ObsidianCodex',
  count = artCount(key)
const {
  '2NightsoulBlessing': nightsoulBlessing,
  '4NightsoulConsume': nightsoulConsume,
} = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.add(
    nightsoulBlessing.ifOn(cmpGE(count, 2, percent(0.15)))
  ),
  ownBuff.premod.critRate_.add(
    nightsoulConsume.ifOn(cmpGE(count, 4, percent(0.4)))
  )
)
