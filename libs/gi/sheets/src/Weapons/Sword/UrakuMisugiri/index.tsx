import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  percent,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'UrakuMisugiri'

const normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skill_dmg_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const def_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const normal_dmg_ = subscript(input.weapon.refinement, normal_dmg_arr)

const skill_dmg_ = subscript(input.weapon.refinement, skill_dmg_arr)

const [condTeamGeoPath, condTeamGeo] = cond(key, 'teamGeo')
const teamGeo_mult = 1
const teamGeo_normal_dmg_ = equal(
  condTeamGeo,
  'on',
  prod(percent(teamGeo_mult), normal_dmg_)
)

const teamGeo_skill_dmg_ = equal(
  condTeamGeo,
  'on',
  prod(percent(teamGeo_mult), skill_dmg_)
)

const def_ = subscript(input.weapon.refinement, def_arr)

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_: sum(normal_dmg_, teamGeo_normal_dmg_),
    skill_dmg_: sum(skill_dmg_, teamGeo_skill_dmg_),
    def_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: def_,
        },
        {
          node: infoMut(normal_dmg_, { path: 'normal_dmg_' }),
        },
        {
          node: infoMut(skill_dmg_, { path: 'skill_dmg_' }),
        },
      ],
    },
    {
      value: condTeamGeo,
      path: condTeamGeoPath,
      header: headerTemplate(key, st('conditional')),
      name: st('teamHitOp.geo'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(teamGeo_normal_dmg_, { path: 'normal_dmg_' }),
            },
            {
              node: infoMut(teamGeo_skill_dmg_, { path: 'skill_dmg_' }),
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
