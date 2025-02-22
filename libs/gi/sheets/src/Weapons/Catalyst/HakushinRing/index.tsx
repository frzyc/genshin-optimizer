import { ColorText } from '@genshin-optimizer/common/ui'
import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  equalStr,
  infoMut,
  input,
  subscript,
  target,
  unequal,
  unequalStr,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'HakushinRing'

const nonElectroEle = allElementKeys.filter((key) => key !== 'electro')

const refinementEleBonusSrc = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]

const [condPassivePath, condPassive] = cond(key, 'SakuraSaiguu')
const eleDmg = subscript(input.weapon.refinement, refinementEleBonusSrc)
const nonstackWrites = objKeyValMap(allElementKeys, (key) => [
  `hakushin${key}`,
  key === 'electro'
    ? unequalStr(condPassive, undefined, input.charKey)
    : equalStr(condPassive, key, input.charKey),
])
const nonElectro_dmg_disp = objKeyMap(nonElectroEle, (key) =>
  nonStackBuff(`hakushin${key}`, `${key}_dmg_`, equal(key, condPassive, eleDmg))
)
const nonElectro_dmg_ = objKeyValMap(nonElectroEle, (key) => [
  `${key}_dmg_`,
  equal(key, target.charEle, nonElectro_dmg_disp[key][0]), // 1st node is active
])

const [electro_dmg_disp, electro_dmg_dispInactive] = nonStackBuff(
  'hakushinelectro',
  'electro_dmg_',
  unequal(condPassive, undefined, eleDmg)
)
const electro_dmg_ = equal('electro', target.charEle, electro_dmg_disp)

const data = dataObjForWeaponSheet(key, {
  teamBuff: {
    premod: {
      electro_dmg_,
      ...nonElectro_dmg_,
    },
    nonStacking: nonstackWrites,
  },
})

const condNames = {
  anemo: <ColorText color="swirl">{stg('reaction.swirl')}</ColorText>,
  cryo: (
    <ColorText color="superconduct">{stg('reaction.superconduct')}</ColorText>
  ),
  geo: <ColorText color="crystallize">{stg('reaction.crystallize')}</ColorText>,
  pyro: <ColorText color="overloaded">{stg('reaction.overloaded')}</ColorText>,
  hydro: (
    <ColorText color="electrocharged">
      {stg('reaction.electrocharged')}
    </ColorText>
  ),
  dendro: <ColorText color="aggravate">{stg('reaction.aggravate')}</ColorText>,
}

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('elementalReaction.electro'),
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      states: objKeyMap(nonElectroEle, (ele) => ({
        name: condNames[ele],
        fields: [
          {
            node: infoMut(nonElectro_dmg_disp[ele][0], {
              path: `${ele}_dmg_`,
              isTeamBuff: true,
            }),
          },
          {
            node: nonElectro_dmg_disp[ele][1],
          },
          {
            node: infoMut(electro_dmg_disp, {
              path: 'electro_dmg_',
              isTeamBuff: true,
            }),
          },
          {
            node: electro_dmg_dispInactive,
          },
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
