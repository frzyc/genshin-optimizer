import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, min, percent, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'FinaleOfTheDeep'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const bond_atkArr = [-1, 0.024, 0.03, 0.036, 0.042, 0.048]
const bond_maxAtkArr = [-1, 150, 187.5, 225, 262.5, 300]

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const base_atk_ = equal(
  condAfterSkill,
  'on',
  subscript(input.weapon.refinement, atk_arr)
)

const hpConsumed = prod(percent(0.25), input.total.hp)
const [condBondPath, condBond] = cond(key, 'bond')
const bond_atk = equal(
  input.weapon.key,
  key,
  equal(
    condBond,
    'on',
    min(
      prod(
        hpConsumed,
        subscript(input.weapon.refinement, bond_atkArr, { unit: '%' })
      ),
      subscript(input.weapon.refinement, bond_maxAtkArr, { unit: '%' })
    )
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      atk_: base_atk_,
      atk: bond_atk,
    },
  },
  { bond_atk }
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
              node: base_atk_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condBondPath,
      value: condBond,
      name: trm('bondCondName'),
      states: {
        on: {
          fields: [
            {
              node: bond_atk,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
