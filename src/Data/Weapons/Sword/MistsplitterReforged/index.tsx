import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, subscript, sum } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { cond } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MistsplitterReforged"
const data_gen = data_gen_json as WeaponData
const eleDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
const eleDmgStack1 = [0.08, 0.1, 0.12, 0.14, 0.16]
const eleDmgStack2 = [0.16, 0.2, 0.24, 0.28, 0.32]
const eleDmgStack3 = [0.28, 0.2, 0.42, 0.49, 0.56]

// TODO: Can someone please fix this atrocity lmao
const [condPath, condNode] = cond(key, "MistsplittersEmblem")

const anemo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `anemo_dmg_` })
const anemo_dmg2_ = equal(input.charEle, 'anemo', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `anemo_dmg_` }))

const geo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `geo_dmg_` })
const geo_dmg2_ = equal(input.charEle, 'geo', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `geo_dmg_` }))

const cryo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `cryo_dmg_` })
const cryo_dmg2_ = equal(input.charEle, 'cryo', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `cryo_dmg_` }))

const pyro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `pyro_dmg_` })
const pyro_dmg2_ = equal(input.charEle, 'pyro', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `pyro_dmg_` }))

const hydro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `hydro_dmg_` })
const hydro_dmg2_ = equal(input.charEle, 'hydro', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `hydro_dmg_` }))

const electro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `electro_dmg_` })
const electro_dmg2_ = equal(input.charEle, 'electro', lookup(condNode, { "1": subscript(input.weapon.refineIndex, eleDmgStack1), "2": subscript(input.weapon.refineIndex, eleDmgStack2), "3": subscript(input.weapon.refineIndex, eleDmgStack3) }, naught, { key: `electro_dmg_` }))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    anemo_dmg_: sum(anemo_dmg_, anemo_dmg2_),
    geo_dmg_: sum(geo_dmg_, geo_dmg2_),
    cryo_dmg_: sum(cryo_dmg_, cryo_dmg2_),
    pyro_dmg_: sum(pyro_dmg_, pyro_dmg2_),
    hydro_dmg_: sum(hydro_dmg_, hydro_dmg2_),
    electro_dmg_: sum(electro_dmg_, electro_dmg2_),
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [
      { node: anemo_dmg_ },
      { node: geo_dmg_ },
      { node: cryo_dmg_ },
      { node: pyro_dmg_ },
      { node: hydro_dmg_ },
      { node: electro_dmg_ }
    ],
    conditional: {
      value: condNode,
      path: condPath,
      name: "Mistsplitter's Emblem",
      states: {
        1: {
          name: "1",
          fields: [
            { node: anemo_dmg2_ },
            { node: cryo_dmg2_ },
            { node: electro_dmg2_ },
            { node: geo_dmg2_ },
            { node: hydro_dmg2_ },
            { node: pyro_dmg2_ },
          ]
        },
        2: {
          name: "2",
          fields: [
            { node: anemo_dmg2_ },
            { node: cryo_dmg2_ },
            { node: electro_dmg2_ },
            { node: geo_dmg2_ },
            { node: hydro_dmg2_ },
            { node: pyro_dmg2_ },
          ]
        },
        3: {
          name: "3",
          fields: [
            { node: anemo_dmg2_ },
            { node: cryo_dmg2_ },
            { node: electro_dmg2_ },
            { node: geo_dmg2_ },
            { node: hydro_dmg2_ },
            { node: pyro_dmg2_ },
          ]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)