import { input } from '../../../../Formula'
import {
  equal,
  infoMut,
  percent,
  prod,
  subscript,
  unequal,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'XiphosMoonlight'
const data_gen = allStats.weapon.data[key]

const enerRech_arr = [0.00036, 0.00045, 0.00054, 0.00063, 0.00072]
const selfEnerRech_ = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refineIndex, enerRech_arr, {
      unit: '%',
      fixed: 3,
    }),
    input.premod.eleMas
  )
)
const teamEnerRech_disp = equal(
  input.weapon.key,
  key,
  prod(percent(0.3), selfEnerRech_)
)
const teamEnerRech_ = unequal(
  input.activeCharKey,
  input.charKey,
  teamEnerRech_disp
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
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
  }
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
            ...KeyMap.info('enerRech_'),
            isTeamBuff: true,
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
