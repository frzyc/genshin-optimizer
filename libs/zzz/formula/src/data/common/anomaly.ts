import { cmpGE } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../util'

const { frostbite, windswept } = allBoolConditionals('anomaly')
export const { anomTimePassed } = allNumConditionals('anomaly', true, 0, 30)

export default register(
  'anomaly',
  registerBuff(
    'frostbite_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(team.common.count.ice, 1, frostbite.ifOn(percent(0.1)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'windswept_direct_dmg_',
    teamBuff.combat.direct_dmg_.add(
      cmpGE(team.common.count.wind, 1, windswept.ifOn(percent(0.1)))
    ),
    undefined,
    true
  )
)
