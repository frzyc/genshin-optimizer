import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
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
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WanderingEvenstar'
const data_gen = allStats.weapon.data[key]

const atkArr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const selfAtk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, atkArr, { unit: '%' }),
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
