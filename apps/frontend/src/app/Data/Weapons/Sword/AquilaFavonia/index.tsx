import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customDmgNode } from '../../../Characters/dataUtil'
import { stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'AquilaFavonia'
const data_gen = allStats.weapon.data[key]

const atkDealt = [2, 2.3, 2.6, 2.9, 3.2]
const hpRegen = [1, 1.15, 1.3, 1.45, 1.6]
const atk_ = subscript(
  input.weapon.refineIndex,
  data_gen.addProps.map((x) => x.atk_ ?? NaN)
)
const heal = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refineIndex, hpRegen, { unit: '%' }),
    input.premod.atk
  )
)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refineIndex, atkDealt, { unit: '%' }),
      input.premod.atk
    ),
    'elemental',
    { hit: { ele: constant('physical') } }
  )
)

export const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      atk_,
    },
  },
  {
    heal,
    dmg,
  }
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
export default new WeaponSheet(key, sheet, data_gen, data)
