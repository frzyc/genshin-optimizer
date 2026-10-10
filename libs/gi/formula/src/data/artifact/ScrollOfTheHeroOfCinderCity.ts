import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpGE, sum } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ScrollOfTheHeroOfCinderCity',
  count = artCount(key)
const cond = allBoolConditionals(key)

const reactOnCount = sum(
  ...allElementKeys.map((ele) => cond[`react_${ele}`].ifOn(1))
)
const reactAndNightsoulOnCount = sum(
  ...allElementKeys.map((ele) =>
    cond[`react_${ele}`].ifOn(cond[`nightsoul_${ele}`].ifOn(1))
  )
)

export default registerArt(
  key,
  ...allElementKeys.flatMap((ele) => {
    const baseOn = cmpGE(
      sum(
        cmpEq(own.char.ele, ele, cmpGE(reactOnCount, 1, 1)),
        cond[`react_${ele}`].ifOn(1)
      ),
      1,
      percent(0.12)
    )
    const nsOn = cmpGE(
      sum(
        cmpEq(own.char.ele, ele, cmpGE(reactAndNightsoulOnCount, 1, 1)),
        cond[`react_${ele}`].ifOn(cond[`nightsoul_${ele}`].ifOn(1))
      ),
      1,
      percent(0.28)
    )
    // WR non-stacks 12% and 28% on different tally keys, then sums.
    // One addOnce(setKey) on the same dmg_ tag would keep only one layer.
    return [
      ...teamBuff.premod.dmg_[ele].addOnce(
        key,
        cmpGE(count, 4, sum(baseOn, nsOn))
      ),
    ]
  })
)
