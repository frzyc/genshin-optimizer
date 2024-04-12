import { ColorText } from '@genshin-optimizer/common/ui'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'HakushinRing'

const refinementEleBonusSrc = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]

const [condPassivePath, condPassive] = cond(key, 'SakuraSaiguu')
const eleDmg = subscript(input.weapon.refinement, refinementEleBonusSrc)
const anemo_dmg_disp = equal('anemo', condPassive, eleDmg)
const cryo_dmg_disp = equal('cryo', condPassive, eleDmg)
const geo_dmg_disp = equal('geo', condPassive, eleDmg)
const hydro_dmg_disp = equal('hydro', condPassive, eleDmg)
const pyro_dmg_disp = equal('pyro', condPassive, eleDmg)
const dendro_dmg_disp = equal('dendro', condPassive, eleDmg)
const anemo_dmg_ = equal('anemo', target.charEle, anemo_dmg_disp)
const cryo_dmg_ = equal('cryo', target.charEle, cryo_dmg_disp)
const geo_dmg_ = equal('geo', target.charEle, geo_dmg_disp)
const hydro_dmg_ = equal('hydro', target.charEle, hydro_dmg_disp)
const pyro_dmg_ = equal('pyro', target.charEle, pyro_dmg_disp)
const dendro_dmg_ = equal('dendro', target.charEle, dendro_dmg_disp)

const electro_dmg_disp = unequal(condPassive, undefined, eleDmg)
const electro_dmg_ = equal('electro', target.charEle, electro_dmg_disp)

const data = dataObjForWeaponSheet(key, {
  teamBuff: {
    premod: {
      anemo_dmg_,
      cryo_dmg_,
      electro_dmg_,
      geo_dmg_,
      hydro_dmg_,
      pyro_dmg_,
      dendro_dmg_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('elementalReaction.electro'),
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      states: {
        anemo: {
          name: <ColorText color="swirl">{stg('reaction.swirl')}</ColorText>,
          fields: [
            {
              node: infoMut(anemo_dmg_disp, {
                path: 'anemo_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
        cryo: {
          name: (
            <ColorText color="superconduct">
              {stg('reaction.superconduct')}
            </ColorText>
          ),
          fields: [
            {
              node: infoMut(cryo_dmg_disp, {
                path: 'cryo_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
        geo: {
          name: (
            <ColorText color="crystallize">
              {stg('reaction.crystallize')}
            </ColorText>
          ),
          fields: [
            {
              node: infoMut(geo_dmg_disp, {
                path: 'geo_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
        pyro: {
          name: (
            <ColorText color="overloaded">
              {stg('reaction.overloaded')}
            </ColorText>
          ),
          fields: [
            {
              node: infoMut(pyro_dmg_disp, {
                path: 'pyro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
        hydro: {
          name: (
            <ColorText color="electrocharged">
              {stg('reaction.electrocharged')}
            </ColorText>
          ),
          fields: [
            {
              node: infoMut(hydro_dmg_disp, {
                path: 'hydro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
        dendro: {
          name: (
            <ColorText color="aggravate">{stg('reaction.aggravate')}</ColorText>
          ),
          fields: [
            {
              node: infoMut(dendro_dmg_disp, {
                path: 'dendro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(electro_dmg_disp, {
                path: 'electro_dmg_',
                isTeamBuff: true,
              }),
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
  ],
}
export default new WeaponSheet(sheet, data)
