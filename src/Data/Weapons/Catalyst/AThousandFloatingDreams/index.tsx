import type { WeaponData } from 'pipeline'
import { input, tally, target } from '../../../../Formula'
import { equal, infoMut, lookup, naught, prod, subscript, sum, unequal } from "../../../../Formula/utils"
import KeyMap from '../../../../KeyMap'
import { allElements, WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "AThousandFloatingDreams"
const data_gen = data_gen_json as WeaponData

const self_eleMasArr = [32, 40, 48, 56, 64]
const self_eleDmg_arr = [0.10, 0.14, 0.18, 0.22, 0.26]
const team_eleMasArr = [40, 42, 44, 46, 48]

const numSameElement = lookup(input.charEle, Object.fromEntries(allElements.map(ele => [
  ele,
  infoMut(sum(tally[ele], -1), { asConst: true }) // Subtract wielder from count
])), naught)
const partySize = sum(...allElements.map(ele => tally[ele]))
const self_eleMas = prod(
  numSameElement,
  subscript(input.weapon.refineIndex, self_eleMasArr)
)
const self_eleDmg_ = Object.fromEntries(allElements.map(ele => [
  `${ele}_dmg_`,
  equal(input.charEle, ele, prod(
    infoMut(sum(partySize, -1, prod(numSameElement, -1)), { asConst: true }),
    subscript(input.weapon.refineIndex, self_eleDmg_arr, { unit: "%" })
  ))
]))

const team_eleMasDisp = equal(input.weapon.key, key,
  subscript(input.weapon.refineIndex, team_eleMasArr),
  { ...KeyMap.info("eleMas"), isTeamBuff: true }
)
const team_eleMas = unequal(input.charKey, target.charKey, team_eleMasDisp)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas: self_eleMas,
    ...self_eleDmg_
  },
  teamBuff: {
    premod: {
      eleMas: team_eleMas
    }
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: self_eleMas
    },
    ...Object.values(self_eleDmg_).map(node => ({ node }))
    ]
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("teamBuff")),
    teamBuff: true,
    fields: [{
      node: team_eleMasDisp
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
