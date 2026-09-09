import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { ownBuff, percent, team } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'DefendersWill',
  count = artCount(key)

export default registerArt(
  key,
  ownBuff.premod.def_.add(cmpGE(count, 2, percent(0.3))),
  ...allElementKeys.map((ele) =>
    ownBuff.premod.res_[ele].add(
      cmpGE(count, 4, cmpGE(team.common.count[ele], 1, percent(0.3)))
    )
  )
)
