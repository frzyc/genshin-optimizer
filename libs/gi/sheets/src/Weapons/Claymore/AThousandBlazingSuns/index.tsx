import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  percent,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AThousandBlazingSuns'

const [condPassivePath, condPassive] = cond(key, 'passive')
const [condNightsoulPath, condNightsoul] = cond(key, 'nightsoul')

const critDMG_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const nsFactor = percent(0.75)

const base_critDMG_ = subscript(input.weapon.refinement, critDMG_arr, {
  unit: '%',
})
const critDMG1_ = equal(condPassive, 'on', base_critDMG_, { path: 'critDMG_' })
const critDMG2_ = equal(
  condPassive,
  'on',
  equal(condNightsoul, 'on', prod(base_critDMG_, nsFactor)),
  { path: 'critDMG_' },
)
const base_atk_ = subscript(input.weapon.refinement, atk_arr, { unit: '%' })
const atk1_ = equal(condPassive, 'on', base_atk_, { path: 'atk_' })
const atk2_ = equal(
  condPassive,
  'on',
  equal(condNightsoul, 'on', prod(base_atk_, nsFactor)),
  { path: 'atk_' },
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    critDMG_: sum(critDMG1_, critDMG2_),
    atk_: sum(atk1_, atk2_),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: critDMG1_,
            },
            {
              node: atk1_,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condNightsoul,
      path: condNightsoulPath,
      header: headerTemplate(key, st('conditional')),
      canShow: equal(condPassive, 'on', 1),
      name: st('nightsoul.blessing'),
      states: {
        on: {
          fields: [
            {
              node: critDMG2_,
            },
            {
              node: atk2_,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
