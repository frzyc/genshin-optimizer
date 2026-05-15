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

const { frostbite } = allBoolConditionals('anomaly')
export const { anomTimePassed } = allNumConditionals('anomaly', true, 0, 20)

export default register(
  'anomaly',
  registerBuff(
    'frostbite_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(team.common.count.ice, 1, frostbite.ifOn(percent(0.1)))
    ),
    undefined,
    true
  )
)
