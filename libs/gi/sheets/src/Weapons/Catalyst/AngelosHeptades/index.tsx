import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  active,
  equal,
  equalStr,
  inferInfoMut,
  infoMut,
  input,
  mergeData,
  min,
  percent,
  prod,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'AngelosHeptades'

const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, atk_arr)
)
const dmg_arr = [-1, 0.1, 0.13, 0.16, 0.19, 0.22]
const maxDmg_arr = [-1, 0.26, 0.34, 0.42, 0.5, 0.58]
const [condShieldPath, condShield] = cond(key, 'shield')
const nonstackWrite = equalStr(condShield, 'on', input.charKey)
const dmg_node = min(
  prod(
    subscript(input.weapon.refinement, dmg_arr, { unit: '%' }),
    input.premod.atk,
    1 / 1000
  ),
  subscript(input.weapon.refinement, maxDmg_arr, { unit: '%' })
)
const [shield_dmg_disp, shield_dmg_inactive] = nonStackBuff(
  'angelos',
  'all_dmg_',
  dmg_node
)
const shield_dmg_ = equal(input.activeCharKey, target.charKey, shield_dmg_disp)
const [offFieldHex_dmg_disp, offFieldHex_dmg_inactive] = nonStackBuff(
  'angelos',
  'all_dmg_',
  prod(percent(0.5), dmg_node)
)
const offFieldHex_dmg_ = equal(
  target.flags.isHexerei,
  1,
  unequal(active.charKey, target.charKey, offFieldHex_dmg_disp)
)

const data = dataObjForWeaponSheet(
  key,
  mergeData(
    [
      {
        premod: {
          atk_,
        },
        teamBuff: {
          premod: {
            all_dmg_: shield_dmg_,
          },
          nonStacking: {
            angelos: nonstackWrite,
          },
        },
      },
      {
        teamBuff: {
          premod: { all_dmg_: offFieldHex_dmg_ },
        },
      },
    ].map((d) => inferInfoMut(d))
  )
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condShieldPath,
      value: condShield,
      teamBuff: true,
      name: st('creatingShield'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(shield_dmg_disp, {
                path: 'dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: shield_dmg_inactive,
            },
            {
              node: infoMut(offFieldHex_dmg_disp, {
                path: 'all_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: offFieldHex_dmg_inactive,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
