import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'
const key: WeaponKey = 'TheWidsith'
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans('weapon', key)

const refinementAtkVals = [0.6, 0.75, 0.9, 1.05, 1.2]
const refinementEleDmgVals = [0.48, 0.6, 0.72, 0.84, 0.96]
const refinementEleMasVals = [240, 300, 360, 420, 480]

const [condPassivePath, condPassive] = cond(key, 'Debut')
const atk_ = equal(
  'recitative',
  condPassive,
  subscript(input.weapon.refineIndex, refinementAtkVals)
)
const eleBonus_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    equal(
      'aria',
      condPassive,
      subscript(input.weapon.refineIndex, refinementEleDmgVals)
    ),
  ])
)
const eleMas = equal(
  'interlude',
  condPassive,
  subscript(input.weapon.refineIndex, refinementEleMasVals)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    ...Object.fromEntries(
      allElementKeys.map((ele) => [`${ele}_dmg_`, eleBonus_[ele]])
    ),
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: tr('passiveName'),
      states: {
        aria: {
          name: trm('aria'),
          fields: [
            ...allElementKeys.map((ele) => ({ node: eleBonus_[ele] })),
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        interlude: {
          name: trm('interlude'),
          fields: [
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        recitative: {
          name: trm('recitative'),
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
