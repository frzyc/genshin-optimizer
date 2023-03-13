import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
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

const key: WeaponKey = 'SkywardPride'
const data_gen = data_gen_json as WeaponData

const dmgInc = [0.08, 0.1, 0.12, 0.14, 0.16]
const dmgPerc = [0.8, 1, 1.2, 1.4, 1.6]
const all_dmg_ = subscript(input.weapon.refineIndex, dmgInc)
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
      all_dmg_,
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
          node: all_dmg_,
        },
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
