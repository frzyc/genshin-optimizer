import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, lookup } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'WanderersTroupe',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  ownBuff.premod.dmg_.charged.add(
    cmpGE(
      count,
      4,
      lookup(
        own.common.weaponType,
        { catalyst: percent(0.35), bow: percent(0.35) },
        0
      )
    )
  )
)
