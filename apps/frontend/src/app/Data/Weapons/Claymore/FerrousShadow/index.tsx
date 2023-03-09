import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'FerrousShadow'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

// const hpThreshold = [0.7, 0.75, 0.8, 0.85, 0.9]
const bonusInc = [0.3, 0.35, 0.4, 0.45, 0.5]
const [condPassivePath, condPassive] = cond(key, 'Unbending')
const charged_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, bonusInc)
)
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      // TODO: need st("lessPercentHP", { percent: xx }) to change depending on the weapon refine index.
      // Probably need to change IConditional.name to have (data:Data)=>Displayable as well.
      name: trm('condName'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: charged_dmg_,
            },
            {
              text: trm('resistance'),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
