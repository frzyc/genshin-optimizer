import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'TinyMiracle',
  count = artCount(key)
const { element } = allListConditionals(key, [...allElementKeys])

export default registerArt(
  key,
  ...allElementKeys.flatMap((ele) => [
    ownBuff.premod.res_[ele].add(cmpGE(count, 2, percent(0.2))),
    ownBuff.premod.res_[ele].add(
      cmpGE(
        count,
        4,
        percent(
          element.map(objKeyMap(allElementKeys, (e) => (e === ele ? 0.3 : 0)))
        )
      )
    ),
  ])
)
