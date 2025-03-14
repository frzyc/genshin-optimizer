import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FerrousShadow'
const [, trm] = trans('weapon', key)

// const hpThreshold = [0.7, 0.75, 0.8, 0.85, 0.9]
const bonusInc = [-1, 0.3, 0.35, 0.4, 0.45, 0.5]
const [condPassivePath, condPassive] = cond(key, 'Unbending')
const charged_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, bonusInc),
)
const data = dataObjForWeaponSheet(key, {
  premod: {
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      // TODO: need st("lessPercentHP", { percent: xx }) to change depending on the weapon refinement.
      // Probably need to change IConditional.name to have (data:Data)=>ReactNode as well.
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
export default new WeaponSheet(sheet, data)
