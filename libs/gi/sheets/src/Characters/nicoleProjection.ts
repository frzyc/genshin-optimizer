import { allStats } from '@genshin-optimizer/gi/stats'
import {
  active,
  compareEq,
  equalStr,
  greaterEq,
  inactive1,
  inactive2,
  inactive3,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { charTemplates } from './charTemplates'
import { customDmgNode } from './dataUtil'

const nicoleKey = 'Nicole'
const nicoleBurst = lookup(
  compareEq(
    active.charKey,
    nicoleKey,
    'active',
    compareEq(
      inactive1.charKey,
      nicoleKey,
      'inactive1',
      compareEq(
        inactive2.charKey,
        nicoleKey,
        'inactive2',
        equalStr(inactive3.charKey, nicoleKey, 'inactive3')
      )
    )
  ),
  {
    active: active.total.burst,
    inactive1: inactive1.total.burst,
    inactive2: inactive2.total.burst,
    inactive3: inactive3.total.burst,
  },
  -1
)
const nicoleConstellation = lookup(
  compareEq(
    active.charKey,
    nicoleKey,
    'active',
    compareEq(
      inactive1.charKey,
      nicoleKey,
      'inactive1',
      compareEq(
        inactive2.charKey,
        nicoleKey,
        'inactive2',
        equalStr(inactive3.charKey, nicoleKey, 'inactive3')
      )
    )
  ),
  {
    active: active.constellation,
    inactive1: inactive1.constellation,
    inactive2: inactive2.constellation,
    inactive3: inactive3.constellation,
  },
  naught
)
const nicoleBurstScaling = allStats.char.skillParam.Nicole.burst[1]
const nicoleC1Scaling = allStats.char.skillParam.Nicole.constellation1[0]
const nicoleCt = charTemplates('Nicole')

export const projections = {
  burstArcaneProjectionDmg: infoMut(
    unequal(
      nicoleBurst,
      -1,
      customDmgNode(
        prod(
          subscript(nicoleBurst, nicoleBurstScaling, { unit: '%' }),
          input.total.atk
        ),
        'elemental',
        { hit: { ele: input.charEle } }
      )
    ),
    { name: nicoleCt.chg('burst.skillParams.1') }
  ),
  c1ArcaneProjectionUnityDmg: infoMut(
    greaterEq(
      nicoleConstellation,
      1,
      customDmgNode(
        prod(percent(nicoleC1Scaling), input.total.atk),
        'elemental',
        { hit: { ele: input.charEle } }
      )
    ),
    { name: nicoleCt.ch('arcaneProjectionDmg') }
  ),
}
