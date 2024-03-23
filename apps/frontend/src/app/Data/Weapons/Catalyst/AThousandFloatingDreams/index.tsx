import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, tally, target } from '../../../../Formula'
import {
  equal,
  infoMut,
  lookup,
  naught,
  prod,
  subscript,
  sum,
  unequal,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AThousandFloatingDreams'
const data_gen = allStats.weapon.data[key]

const self_eleMasArr = [-1, 32, 40, 48, 56, 64]
const self_eleDmg_arr = [-1, 0.1, 0.14, 0.18, 0.22, 0.26]
const team_eleMasArr = [-1, 40, 42, 44, 46, 48]

const numSameElement = lookup(
  input.charEle,
  Object.fromEntries(
    allElementKeys.map((ele) => [
      ele,
      infoMut(sum(tally[ele], -1), { asConst: true }), // Subtract wielder from count
    ])
  ),
  naught
)
const partySize = sum(...allElementKeys.map((ele) => tally[ele]))
const self_eleMas = prod(
  numSameElement,
  subscript(input.weapon.refinement, self_eleMasArr)
)
const self_eleDmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    equal(
      input.charEle,
      ele,
      prod(
        infoMut(sum(partySize, -1, prod(numSameElement, -1)), {
          asConst: true,
        }),
        subscript(input.weapon.refinement, self_eleDmg_arr, { unit: '%' })
      )
    ),
  ])
)

const team_eleMasDisp = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, team_eleMasArr),
  { ...KeyMap.info('eleMas'), isTeamBuff: true }
)
// Apply to non-equipped character
const team_eleMas = unequal(input.charKey, target.charKey, team_eleMasDisp)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas: self_eleMas,
    ...self_eleDmg_,
  },
  teamBuff: {
    premod: {
      eleMas: team_eleMas,
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: self_eleMas,
        },
        ...Object.values(self_eleDmg_).map((node) => ({ node })),
      ],
    },
    {
      header: headerTemplate(key, st('teamBuff')),
      teamBuff: true,
      fields: [
        {
          node: team_eleMasDisp,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
