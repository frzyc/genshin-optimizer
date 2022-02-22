import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, percent, subscript, sum } from "../../../../Formula/utils"
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
const eleDmg2 = [[0.08, 0.16, 0.28], [0.1, 0.2, 0.35], [0.12, 0.24, 0.42], [0.14, 0.28, 0.49], [0.16, 0.32, 0.56]]
const eleDmg2R1 = [0.08, 0.16, 0.28]
const eleDmg2R2 = [0.1, 0.2, 0.35]
const eleDmg2R3 = [0.12, 0.24, 0.42]
const eleDmg2R4 = [0.14, 0.28, 0.49]
const eleDmg2R5 = [0.16, 0.32, 0.56]

// TODO: Can someone please fix this atrocity lmao
const [condPath, condNode] = cond(key, "MistsplittersEmblem")

const anemo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `anemo_dmg_` })
const anemo_dmg_R1_ = equal(input.charEle, 'anemo', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `anemo_dmg_` })))
const anemo_dmg_R2_ = equal(input.charEle, 'anemo', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `anemo_dmg_` })))
const anemo_dmg_R3_ = equal(input.charEle, 'anemo', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `anemo_dmg_` })))
const anemo_dmg_R4_ = equal(input.charEle, 'anemo', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `anemo_dmg_` })))
const anemo_dmg_R5_ = equal(input.charEle, 'anemo', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `anemo_dmg_` })))

const geo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `geo_dmg_` })
const geo_dmg_R1_ = equal(input.charEle, 'geo', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `geo_dmg_` })))
const geo_dmg_R2_ = equal(input.charEle, 'geo', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `geo_dmg_` })))
const geo_dmg_R3_ = equal(input.charEle, 'geo', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `geo_dmg_` })))
const geo_dmg_R4_ = equal(input.charEle, 'geo', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `geo_dmg_` })))
const geo_dmg_R5_ = equal(input.charEle, 'geo', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `geo_dmg_` })))

const cryo_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `cryo_dmg_` })
const cryo_dmg_R1_ = equal(input.charEle, 'cryo', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `cryo_dmg_` })))
const cryo_dmg_R2_ = equal(input.charEle, 'cryo', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `cryo_dmg_` })))
const cryo_dmg_R3_ = equal(input.charEle, 'cryo', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `cryo_dmg_` })))
const cryo_dmg_R4_ = equal(input.charEle, 'cryo', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `cryo_dmg_` })))
const cryo_dmg_R5_ = equal(input.charEle, 'cryo', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `cryo_dmg_` })))

const pyro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `pyro_dmg_` })
const pyro_dmg_R1_ = equal(input.charEle, 'pyro', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `pyro_dmg_` })))
const pyro_dmg_R2_ = equal(input.charEle, 'pyro', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `pyro_dmg_` })))
const pyro_dmg_R3_ = equal(input.charEle, 'pyro', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `pyro_dmg_` })))
const pyro_dmg_R4_ = equal(input.charEle, 'pyro', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `pyro_dmg_` })))
const pyro_dmg_R5_ = equal(input.charEle, 'pyro', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `pyro_dmg_` })))

const hydro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `hydro_dmg_` })
const hydro_dmg_R1_ = equal(input.charEle, 'hydro', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `hydro_dmg_` })))
const hydro_dmg_R2_ = equal(input.charEle, 'hydro', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `hydro_dmg_` })))
const hydro_dmg_R3_ = equal(input.charEle, 'hydro', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `hydro_dmg_` })))
const hydro_dmg_R4_ = equal(input.charEle, 'hydro', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `hydro_dmg_` })))
const hydro_dmg_R5_ = equal(input.charEle, 'hydro', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `hydro_dmg_` })))

const electro_dmg_ = subscript(input.weapon.refineIndex, eleDmg, { key: `electro_dmg_` })
const electro_dmg_R1_ = equal(input.charEle, 'electro', equal(input.weapon.refinement, 1, lookup(condNode, { "1": percent(eleDmg2R1[0]), "2": percent(eleDmg2R1[1]), "3": percent(eleDmg2R1[2]) }, naught, { key: `electro_dmg_` })))
const electro_dmg_R2_ = equal(input.charEle, 'electro', equal(input.weapon.refinement, 2, lookup(condNode, { "1": percent(eleDmg2R2[0]), "2": percent(eleDmg2R2[1]), "3": percent(eleDmg2R2[2]) }, naught, { key: `electro_dmg_` })))
const electro_dmg_R3_ = equal(input.charEle, 'electro', equal(input.weapon.refinement, 3, lookup(condNode, { "1": percent(eleDmg2R3[0]), "2": percent(eleDmg2R3[1]), "3": percent(eleDmg2R3[2]) }, naught, { key: `electro_dmg_` })))
const electro_dmg_R4_ = equal(input.charEle, 'electro', equal(input.weapon.refinement, 4, lookup(condNode, { "1": percent(eleDmg2R4[0]), "2": percent(eleDmg2R4[1]), "3": percent(eleDmg2R4[2]) }, naught, { key: `electro_dmg_` })))
const electro_dmg_R5_ = equal(input.charEle, 'electro', equal(input.weapon.refinement, 5, lookup(condNode, { "1": percent(eleDmg2R5[0]), "2": percent(eleDmg2R5[1]), "3": percent(eleDmg2R5[2]) }, naught, { key: `electro_dmg_` })))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    anemo_dmg_: sum(anemo_dmg_, anemo_dmg_R1_, anemo_dmg_R2_, anemo_dmg_R3_, anemo_dmg_R4_, anemo_dmg_R5_),
    geo_dmg_: sum(geo_dmg_, geo_dmg_R1_, geo_dmg_R2_, geo_dmg_R3_, geo_dmg_R4_, geo_dmg_R5_),
    cryo_dmg_: sum(cryo_dmg_, cryo_dmg_R1_, cryo_dmg_R2_, cryo_dmg_R3_, cryo_dmg_R4_, cryo_dmg_R5_),
    pyro_dmg_: sum(pyro_dmg_, pyro_dmg_R1_, pyro_dmg_R2_, pyro_dmg_R3_, pyro_dmg_R4_, pyro_dmg_R5_),
    hydro_dmg_: sum(hydro_dmg_, hydro_dmg_R1_, hydro_dmg_R2_, hydro_dmg_R3_, hydro_dmg_R4_, hydro_dmg_R5_),
    electro_dmg_: sum(electro_dmg_, electro_dmg_R1_, electro_dmg_R2_, electro_dmg_R3_, electro_dmg_R4_, electro_dmg_R5_),
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
            { node: anemo_dmg_R1_ },
            { node: anemo_dmg_R2_ },
            { node: anemo_dmg_R3_ },
            { node: anemo_dmg_R4_ },
            { node: anemo_dmg_R5_ },
            { node: pyro_dmg_R1_ },
            { node: pyro_dmg_R2_ },
            { node: pyro_dmg_R3_ },
            { node: pyro_dmg_R4_ },
            { node: pyro_dmg_R5_ },
            { node: hydro_dmg_R1_ },
            { node: hydro_dmg_R2_ },
            { node: hydro_dmg_R3_ },
            { node: hydro_dmg_R4_ },
            { node: hydro_dmg_R5_ },
            { node: cryo_dmg_R1_ },
            { node: cryo_dmg_R2_ },
            { node: cryo_dmg_R3_ },
            { node: cryo_dmg_R4_ },
            { node: cryo_dmg_R5_ },
            { node: geo_dmg_R1_ },
            { node: geo_dmg_R2_ },
            { node: geo_dmg_R3_ },
            { node: geo_dmg_R4_ },
            { node: geo_dmg_R5_ },
            { node: electro_dmg_R1_ },
            { node: electro_dmg_R2_ },
            { node: electro_dmg_R3_ },
            { node: electro_dmg_R4_ },
            { node: electro_dmg_R5_ },
          ]
        },
        2: {
          name: "2",
          fields: [
            { node: anemo_dmg_R1_ },
            { node: anemo_dmg_R2_ },
            { node: anemo_dmg_R3_ },
            { node: anemo_dmg_R4_ },
            { node: anemo_dmg_R5_ },
            { node: pyro_dmg_R1_ },
            { node: pyro_dmg_R2_ },
            { node: pyro_dmg_R3_ },
            { node: pyro_dmg_R4_ },
            { node: pyro_dmg_R5_ },
            { node: hydro_dmg_R1_ },
            { node: hydro_dmg_R2_ },
            { node: hydro_dmg_R3_ },
            { node: hydro_dmg_R4_ },
            { node: hydro_dmg_R5_ },
            { node: cryo_dmg_R1_ },
            { node: cryo_dmg_R2_ },
            { node: cryo_dmg_R3_ },
            { node: cryo_dmg_R4_ },
            { node: cryo_dmg_R5_ },
            { node: geo_dmg_R1_ },
            { node: geo_dmg_R2_ },
            { node: geo_dmg_R3_ },
            { node: geo_dmg_R4_ },
            { node: geo_dmg_R5_ },
            { node: electro_dmg_R1_ },
            { node: electro_dmg_R2_ },
            { node: electro_dmg_R3_ },
            { node: electro_dmg_R4_ },
            { node: electro_dmg_R5_ },
          ]
        },
        3: {
          name: "3",
          fields: [
            { node: anemo_dmg_R1_ },
            { node: anemo_dmg_R2_ },
            { node: anemo_dmg_R3_ },
            { node: anemo_dmg_R4_ },
            { node: anemo_dmg_R5_ },
            { node: pyro_dmg_R1_ },
            { node: pyro_dmg_R2_ },
            { node: pyro_dmg_R3_ },
            { node: pyro_dmg_R4_ },
            { node: pyro_dmg_R5_ },
            { node: hydro_dmg_R1_ },
            { node: hydro_dmg_R2_ },
            { node: hydro_dmg_R3_ },
            { node: hydro_dmg_R4_ },
            { node: hydro_dmg_R5_ },
            { node: cryo_dmg_R1_ },
            { node: cryo_dmg_R2_ },
            { node: cryo_dmg_R3_ },
            { node: cryo_dmg_R4_ },
            { node: cryo_dmg_R5_ },
            { node: geo_dmg_R1_ },
            { node: geo_dmg_R2_ },
            { node: geo_dmg_R3_ },
            { node: geo_dmg_R4_ },
            { node: geo_dmg_R5_ },
            { node: electro_dmg_R1_ },
            { node: electro_dmg_R2_ },
            { node: electro_dmg_R3_ },
            { node: electro_dmg_R4_ },
            { node: electro_dmg_R5_ },
          ]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)