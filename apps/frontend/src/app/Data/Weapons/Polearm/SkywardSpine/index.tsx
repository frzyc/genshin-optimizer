import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  percent,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'SkywardSpine'
const data_gen = data_gen_json as WeaponData

const critRateInc = [0.08, 0.1, 0.12, 0.14, 0.16]
const dmgPerc = [0.4, 0.55, 0.7, 0.85, 1]
const atkSPD_ = percent(0.12)
const critRate_ = subscript(input.weapon.refineIndex, critRateInc)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refineIndex, dmgPerc, { unit: '%' }),
      input.total.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)
const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      critRate_,
      atkSPD_,
    },
  },
  {
    dmg,
  }
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: critRate_,
        },
        {
          node: atkSPD_,
        },
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
