import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { ownBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'Adventurer',
  count = artCount(key)

export default registerArt(key, ownBuff.premod.hp.add(cmpGE(count, 2, 1000)))
