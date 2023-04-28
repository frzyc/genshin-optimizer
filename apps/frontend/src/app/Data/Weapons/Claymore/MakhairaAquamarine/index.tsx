import type { WeaponData } from '@genshin-optimizer/pipeline'
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
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'MakhairaAquamarine'
const data_gen = data_gen_json as WeaponData

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
