import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customShieldNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheBell'

const shieldSrc = [-1, 0.2, 0.23, 0.26, 0.29, 0.32]
const allDmgSrc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const [condPassivePath, condPassive] = cond(key, 'RebelliousGuardian')
const shield = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    customShieldNode(
      prod(
        subscript(input.weapon.refinement, shieldSrc, { unit: '%' }),
        input.total.hp
      )
    )
  )
)
const [condWithShieldPath, condWithShield] = cond(key, 'WithShield')
const all_dmg_ = equal(
  condWithShield,
  'protected',
  subscript(input.weapon.refinement, allDmgSrc, { unit: '%' })
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      all_dmg_,
    },
  },
  {
    shield,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('takeDmg'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(shield, { name: stg('dmgAbsorption') }),
            },
            {
              text: stg('cd'),
              value: 45,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condWithShield,
      path: condWithShieldPath,
      header: headerTemplate(key, st('conditional')),
      name: st('protectedByShield'),
      states: {
        protected: {
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
