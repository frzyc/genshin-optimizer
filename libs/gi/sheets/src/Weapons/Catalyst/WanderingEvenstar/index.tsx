import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  percent,
  prod,
  subscript,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WanderingEvenstar'

const atkArr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const selfAtk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, atkArr, { unit: '%' }),
    input.premod.eleMas,
  ),
)
const teamAtkDisp = equal(input.weapon.key, key, prod(percent(0.3), selfAtk))
// Apply to non-equipped character
const teamAtk = unequal(input.activeCharKey, input.charKey, teamAtkDisp)

const data = dataObjForWeaponSheet(
  key,
  {
    total: {
      atk: selfAtk,
    },
    teamBuff: {
      total: {
        atk: teamAtk,
      },
    },
  },
  {
    selfAtk,
    teamAtkDisp,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: selfAtk,
        },
      ],
    },
    {
      header: headerTemplate(key, st('teamBuff')),
      teamBuff: true,
      fields: [
        {
          node: infoMut(teamAtkDisp, {
            path: 'atk',
            isTeamBuff: true,
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
