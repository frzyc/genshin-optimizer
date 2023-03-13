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
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'MakhairaAquamarine'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')

const atk_arr = [0.24, 0.3, 0.36, 0.42, 0.48]
const atkSelf = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    prod(
      subscript(input.weapon.refineIndex, atk_arr, { unit: '%' }),
      input.premod.eleMas
    )
  )
)
const atkTeamDisp = equal(input.weapon.key, key, prod(percent(0.3), atkSelf))
const atkTeam = unequal(input.activeCharKey, input.charKey, atkTeamDisp)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    total: {
      atk: atkSelf,
    },
    teamBuff: {
      total: {
        atk: atkTeam,
      },
    },
  },
  {
    atkSelf,
    atkTeamDisp,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condPassivePath,
      value: condPassive,
      teamBuff: true,
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: atkSelf,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('teamBuff')),
      teamBuff: true,
      canShow: equal(condPassive, 'on', 1),
      fields: [
        {
          node: infoMut(atkTeamDisp, {
            ...KeyMap.info('atk'),
            isTeamBuff: true,
          }),
        },
        {
          text: stg('duration'),
          value: 12,
          unit: 's',
        },
      ],
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
