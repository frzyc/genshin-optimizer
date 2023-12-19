import { allElementKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import {
  equal,
  infoMut,
  min,
  percent,
  prod,
  subscript,
  sum,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'FlowingPurity'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const all_ele_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const bond_all_ele_dmg_arr = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]
const bond_max_ele_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const base_ele_dmg_ = equal(
  condAfterSkill,
  'on',
  subscript(input.weapon.refinement, all_ele_dmg_arr)
)
const allEleNoPhysDmgKeys = allElementKeys.map((ele) => `${ele}_dmg_`)
const afterSkill_all_ele_dmg_map = objKeyMap(allEleNoPhysDmgKeys, (ele_dmg_) =>
  infoMut({ ...base_ele_dmg_ }, KeyMap.info(ele_dmg_))
)

const hpConsumed = prod(percent(0.24), input.total.hp)
const [condBondPath, condBond] = cond(key, 'bond')
const bond_all_ele_dmg_ = equal(
  input.weapon.key,
  key,
  equal(
    condBond,
    'on',
    min(
      prod(
        subscript(input.weapon.refinement, bond_all_ele_dmg_arr, { unit: '%' }),
        prod(hpConsumed, percent(1 / 1000))
      ),
      subscript(input.weapon.refinement, bond_max_ele_dmg_arr, { unit: '%' })
    )
  )
)
const bond_all_ele_dmg_map = objKeyMap(allEleNoPhysDmgKeys, (ele_dmg_) =>
  infoMut({ ...bond_all_ele_dmg_ }, KeyMap.info(ele_dmg_))
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      ...objKeyMap(allEleNoPhysDmgKeys, (ele_dmg_) =>
        sum(
          afterSkill_all_ele_dmg_map[ele_dmg_],
          bond_all_ele_dmg_map[ele_dmg_]
        )
      ),
    },
  },
  bond_all_ele_dmg_map
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
            ...Object.values(afterSkill_all_ele_dmg_map).map((node) => ({
              node,
            })),
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
            ...Object.values(bond_all_ele_dmg_map).map((node) => ({
              node,
            })),
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
