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
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'WanderingEvenstar'
const data_gen = allStats.weapon.data[key]

const atkArr = [0.24, 0.3, 0.36, 0.42, 0.48]
const selfAtk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refineIndex, atkArr, { unit: '%' }),
    input.premod.eleMas
  )
)
const teamAtkDisp = equal(input.weapon.key, key, prod(percent(0.3), selfAtk))
const teamAtk = unequal(input.activeCharKey, input.charKey, teamAtkDisp)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
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
  }
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
            ...KeyMap.info('atk'),
            isTeamBuff: true,
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
