import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'BlizzardStrayer',
  count = artCount(key)
const { state } = allListConditionals(key, ['cryo', 'frozen'])

export default registerArt(
  key,
  ownBuff.premod.dmg_.cryo.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.critRate_.add(
    cmpGE(count, 4, percent(state.map({ cryo: 0.2, frozen: 0.4 })))
  )
)
