import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'CinnabarSpindle'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const eleDmgIncSrc = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'SpotlessHeart')
const skill_dmgInc = equal(
  input.weapon.key,
  key,
  equal(
    'on',
    condPassive,
    prod(
      subscript(input.weapon.refineIndex, eleDmgIncSrc, { unit: '%' }),
      input.premod.def
    )
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      // TODO: should be total
      skill_dmgInc,
    },
  },
  {
    skill_dmgInc,
  }
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
export default new WeaponSheet(key, sheet, data_gen, data)
