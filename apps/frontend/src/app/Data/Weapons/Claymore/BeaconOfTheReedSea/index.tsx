import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { equal, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BeaconOfTheReedSea'
const data_gen = allStats.weapon.data[key]

const afterSkillAtkArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_atk_ = equal(
  input.weapon.key,
  key,
  equal(
    condAfterSkill,
    'on',
    subscript(input.weapon.refinement, afterSkillAtkArr, {
      path: 'atk_',
    })
  )
)

const afterDmgAtkArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const [condAfterDmgPath, condAfterDmg] = cond(key, 'afterDmg')
const afterDmg_atk_ = equal(
  input.weapon.key,
  key,
  equal(
    condAfterDmg,
    'on',
    subscript(input.weapon.refinement, afterDmgAtkArr, {
      path: 'atk_',
    })
  )
)

const noShieldHpArr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]
const [condNoShieldPath, condNoShield] = cond(key, 'noShield')
const noShield_hp_ = equal(
  input.weapon.key,
  key,
  equal(
    condNoShield,
    'on',
    subscript(input.weapon.refinement, noShieldHpArr, {
      path: 'hp_',
    })
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      atk_: sum(afterSkill_atk_, afterDmg_atk_),
      hp_: noShield_hp_,
    },
  },
  {}
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterSkillPath,
      value: condAfterSkill,
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: afterSkill_atk_,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterDmgPath,
      value: condAfterDmg,
      name: st('takeDmg'),
      states: {
        on: {
          fields: [
            {
              node: afterDmg_atk_,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condNoShieldPath,
      value: condNoShield,
      name: st('notProtectedByShield'),
      states: {
        on: {
          fields: [
            {
              node: noShield_hp_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
