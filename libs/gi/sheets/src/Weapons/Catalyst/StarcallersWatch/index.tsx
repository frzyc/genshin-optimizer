import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, equalStr, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'StarcallersWatch'

const eleMasArr = [-1, 100, 125, 150, 175, 200]
const eleMas = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, eleMasArr)
)
const dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const [condShieldPath, condShield] = cond(key, 'shield')
const nonstackWrite = equalStr(condShield, 'on', input.charKey)
const [shield_dmg_, shield_dmg_inactive] = nonStackBuff(
  'starcaller',
  'all_dmg_',
  subscript(input.weapon.refinement, dmg_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
  teamBuff: {
    premod: {
      all_dmg_: shield_dmg_,
    },
    nonStacking: {
      starcaller: nonstackWrite,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: eleMas,
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condShieldPath,
      value: condShield,
      teamBuff: true,
      name: st('creatingShield'),
      states: {
        on: {
          fields: [
            {
              node: shield_dmg_,
            },
            {
              node: shield_dmg_inactive,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
