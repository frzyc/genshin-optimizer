import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpGE, cmpNE, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  team,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'CelestialGift',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.enerRech_.add(cmpGE(count, 2, percent(0.2))),
  ...allElementKeys.flatMap((ele) => {
    const light = set4.ifOn(
      cmpGE(
        count,
        4,
        cmpGE(own.common.hexerei, 1, cmpEq(own.char.ele, ele, percent(0.2)))
      )
    )
    const hymn = set4.ifOn(
      cmpGE(
        count,
        4,
        cmpGE(
          own.common.hexerei,
          1,
          cmpGE(
            team.common.hexerei,
            2,
            cmpGE(
              sum(
                cmpEq(own.char.ele, ele, 1),
                cmpNE(team.common.activeEle[ele], 0, 1)
              ),
              1,
              percent(0.4)
            )
          )
        )
      )
    )
    return [...teamBuff.premod.dmg_[ele].addOnce(key, sum(light, hymn))]
  })
)
