import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AquilaFavonia'
const data_gen = allStats.weapon.data[key]
const atkDealt = [-1, 2, 2.3, 2.6, 2.9, 3.2]
const hpRegen = [-1, 1, 1.15, 1.3, 1.45, 1.6]
const atk_arr = data_gen.refinementBonus.atk_
if (!atk_arr)
  throw new Error(`data_gen.refinementBonus.atk_ for ${key} was undefined`)
const atk_ = subscript(input.weapon.refinement, atk_arr)
const heal = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, hpRegen, { unit: '%' }),
    input.premod.atk,
  ),
)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, atkDealt, { unit: '%' }),
      input.premod.atk,
    ),
    'elemental',
    { hit: { ele: constant('physical') } },
  ),
)

export const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      atk_,
    },
  },
  {
    heal,
    dmg,
  },
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
        },
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
