import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  percent,
  prod,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'XiphosMoonlight'

const enerRech_arr = [-1, 0.00036, 0.00045, 0.00054, 0.00063, 0.00072]
const selfEnerRech_ = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, enerRech_arr, {
      unit: '%',
      fixed: 3,
    }),
    input.premod.eleMas,
  ),
)
const teamEnerRech_disp = equal(
  input.weapon.key,
  key,
  prod(percent(0.3), selfEnerRech_),
)
// Apply to non-equipped character
const teamEnerRech_ = unequal(input.charKey, target.charKey, teamEnerRech_disp)

const data = dataObjForWeaponSheet(
  key,
  {
    total: {
      enerRech_: selfEnerRech_,
    },
    teamBuff: {
      total: {
        enerRech_: teamEnerRech_,
      },
    },
  },
  {
    selfEnerRech_,
    teamEnerRech_disp,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: selfEnerRech_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('teamBuff')),
      teamBuff: true,
      fields: [
        {
          node: infoMut(teamEnerRech_disp, {
            path: 'enerRech_',
            isTeamBuff: true,
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
