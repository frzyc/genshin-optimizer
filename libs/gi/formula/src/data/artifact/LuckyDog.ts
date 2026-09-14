import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { ownBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'LuckyDog',
  count = artCount(key)

export default registerArt(key, ownBuff.premod.def.add(cmpGE(count, 2, 100)))
