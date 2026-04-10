import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'GoldenFrostboundOath'
const [, trm] = trans('weapon', key)

const def_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const selfDmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const teamDmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const base_def_ = subscript(input.weapon.refinement, def_arr)

const [condSkillOrLcPath, condSkillOrLc] = cond(key, 'skillOrLc')
const self_geo_dmg_ = equal(
  condSkillOrLc,
  'on',
  subscript(input.weapon.refinement, selfDmg_arr)
)
const self_lunarcrystallize_dmg_ = { ...self_geo_dmg_ }

const [condMoondriftPath, condMoondrift] = cond(key, 'moondrift')
const team_geo_dmg_disp = equal(
  condSkillOrLc,
  'on',
  equal(condMoondrift, 'on', subscript(input.weapon.refinement, teamDmg_arr))
)
const team_geo_dmg_ = unequal(input.charKey, target.charKey, team_geo_dmg_disp)
const team_lunarcrystallize_dmg_disp = { ...team_geo_dmg_disp }
const team_lunarcrystallize_dmg_ = { ...team_geo_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    def_: base_def_,
    geo_dmg_: self_geo_dmg_,
    lunarcrystallize_dmg_: self_lunarcrystallize_dmg_,
  },
  teamBuff: {
    premod: {
      geo_dmg_: team_geo_dmg_,
      lunarcrystallize_dmg_: team_lunarcrystallize_dmg_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: base_def_,
        },
      ],
    },
    {
      value: condSkillOrLc,
      path: condSkillOrLcPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: self_geo_dmg_,
            },
            {
              node: self_lunarcrystallize_dmg_,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condMoondrift,
      path: condMoondriftPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.moondriftNearby'),
      teamBuff: true,
      canShow: equal(condSkillOrLc, 'on', 1),
      states: {
        on: {
          fields: [
            {
              node: infoMut(team_geo_dmg_disp, team_geo_dmg_.info!),
            },
            {
              node: infoMut(
                team_lunarcrystallize_dmg_disp,
                team_lunarcrystallize_dmg_.info!
              ),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
