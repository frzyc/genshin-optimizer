import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'SharpshootersOath'
const data_gen = data_gen_json as WeaponData

const weakspotDMG_s = [0.24, 0.3, 0.36, 0.42, 0.48]
const weakspotDMG_ = subscript(input.weapon.refineIndex, weakspotDMG_s)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    weakspotDMG_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: weakspotDMG_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
