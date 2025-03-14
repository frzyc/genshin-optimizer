import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum, unequal } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CrimsonMoonsSemblance'

const dmg_1Arr = [-1, 0.12, 0.16, 0.2, 0.24, 0.28]
const dmg_2Arr = [-1, 0.24, 0.32, 0.4, 0.48, 0.56]

const [condBondPath, condBond] = cond(key, 'bond')

const dmg_1 = unequal(
  condBond,
  undefined,
  subscript(input.weapon.refinement, dmg_1Arr),
  { path: 'all_dmg_' },
)
const dmg_2 = equal(
  condBond,
  '2',
  subscript(input.weapon.refinement, dmg_2Arr),
  { path: 'all_dmg_' },
)

const all_dmg_ = sum(dmg_1, dmg_2)

const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_: all_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condBond,
      path: condBondPath,
      header: headerTemplate(key, st('conditional')),
      name: st('bond.current'),
      states: {
        '1': {
          name: '< 30%',
          fields: [
            {
              node: dmg_1,
            },
          ],
        },
        '2': {
          name: '>= 30%',
          fields: [
            {
              node: all_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
