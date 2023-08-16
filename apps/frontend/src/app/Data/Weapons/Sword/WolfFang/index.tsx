import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import {
  constant,
  lookup,
  naught,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WolfFang'
const data_gen = allStats.weapon.data[key]

const skillBurst_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skillBurst_critRate_arr = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]
const stacksArr = range(1, 4)

const skill_dmg_ = subscript(input.weapon.refinement, skillBurst_dmg_arr)
const burst_dmg_ = { ...skill_dmg_ }

const [condSkillStacksPath, condSkillStacks] = cond(key, 'skillStacks')
const skill_critRate_ = prod(
  subscript(input.weapon.refinement, skillBurst_critRate_arr),
  lookup(
    condSkillStacks,
    objKeyMap(stacksArr, (stack) => constant(stack)),
    naught
  )
)

const [condBurstStacksPath, condBurstStacks] = cond(key, 'burstStacks')
const burst_critRate_ = prod(
  subscript(input.weapon.refinement, skillBurst_critRate_arr),
  lookup(
    condBurstStacks,
    objKeyMap(stacksArr, (stack) => constant(stack)),
    naught
  )
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_,
    skill_critRate_,
    burst_critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: skill_dmg_,
        },
        {
          node: burst_dmg_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      value: condSkillStacks,
      path: condSkillStacksPath,
      name: st('hitOp.skill'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: skill_critRate_,
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
    {
      header: headerTemplate(key, st('conditional')),
      value: condBurstStacks,
      path: condBurstStacksPath,
      name: st('hitOp.burst'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: burst_critRate_,
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
