import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AthameArtis'
const [, trm] = trans('weapon', key)

const burstCritDmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const self_atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const team_atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const burstCritDMG_disp = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, burstCritDmg_arr)
)
const burstCritDMG_ = equal(input.hit.move, 'burst', burstCritDMG_disp)

const [condBurstHitPath, condBurstHit] = cond(key, 'burstHit')
const burstHit_selfAtk_ = equal(
  condBurstHit,
  'on',
  subscript(input.weapon.refinement, self_atk_arr)
)
const burstHit_teamAtk_ = equal(
  condBurstHit,
  'on',
  subscript(input.weapon.refinement, team_atk_arr)
)

const hexerei_selfAtk_ = greaterEq(
  tally.hexerei,
  2,
  equal(input.isHexerei, 1, prod(percent(0.75), burstHit_selfAtk_))
)
const hexerei_teamAtk_ = greaterEq(
  tally.hexerei,
  2,
  equal(input.isHexerei, 1, prod(percent(0.75), burstHit_teamAtk_))
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    critDMG_: burstCritDMG_,
    atk_: sum(burstHit_selfAtk_, hexerei_selfAtk_),
  },
  teamBuff: {
    premod: {
      atk_: sum(burstHit_teamAtk_, hexerei_teamAtk_),
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(
            { ...burstCritDMG_disp },
            {
              name: trm('burstCritDMG_'),
              unit: '%',
            }
          ),
        },
      ],
    },
    {
      value: condBurstHit,
      path: condBurstHitPath,
      teamBuff: true,
      name: st('hitOp.burst'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: infoMut(burstHit_selfAtk_, { path: 'atk_' }),
            },
            {
              node: infoMut(burstHit_teamAtk_, {
                path: 'atk_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 3,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, stg('hexerei')),
      teamBuff: true,
      canShow: greaterEq(
        tally.hexerei,
        2,
        equal(input.isHexerei, 1, equal(condBurstHit, 'on', 1))
      ),
      fields: [
        {
          node: infoMut(hexerei_selfAtk_, { path: 'atk_' }),
        },
        {
          node: infoMut(hexerei_teamAtk_, { path: 'atk_', isTeamBuff: true }),
        },
        {
          text: stg('duration'),
          value: 3,
          unit: 's',
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
