import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'Gambler',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.skill.add(cmpGE(count, 2, percent(0.2)))
)
