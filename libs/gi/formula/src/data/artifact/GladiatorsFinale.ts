import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, lookup } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'GladiatorsFinale',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.normal.add(
    cmpGE(
      count,
      4,
      lookup(
        own.common.weaponType,
        {
          sword: percent(0.35),
          claymore: percent(0.35),
          polearm: percent(0.35),
        },
        0
      )
    )
  )
)
