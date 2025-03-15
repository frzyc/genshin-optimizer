import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, prod, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CinnabarSpindle'
const [, trm] = trans('weapon', key)

const eleDmgIncSrc = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'SpotlessHeart')
const skill_dmgInc = equal(
  input.weapon.key,
  key,
  equal(
    'on',
    condPassive,
    prod(
      subscript(input.weapon.refinement, eleDmgIncSrc, { unit: '%' }),
      input.premod.def,
    ),
  ),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      // TODO: should be total
      skill_dmgInc,
    },
  },
  {
    skill_dmgInc,
  },
)
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('name'),
      states: {
        on: {
          fields: [
            {
              node: skill_dmgInc,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
