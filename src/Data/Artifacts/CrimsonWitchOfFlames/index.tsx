import { input } from '../../../Formula'
import { Data, Info } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent, sum } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "CrimsonWitchOfFlames"
const setHeader = setHeaderTemplate(key, icons)

const [condStackPath, condStack] = cond(key, "stack")
const pyro_dmg_info: Info = { key: "pyro_dmg_", variant: "pyro" }
const set2 = greaterEq(input.artSet.CrimsonWitchOfFlames, 2, percent(0.15), pyro_dmg_info)
const set4Overload = greaterEq(input.artSet.CrimsonWitchOfFlames, 4, percent(0.4))
const set4Burning = { ...set4Overload }
const set4Burgeon = { ...set4Overload }
const set4Vape = greaterEq(input.artSet.CrimsonWitchOfFlames, 4, percent(0.15))
const set4Melt = { ...set4Vape }
const stackArr = range(1, 3)
const set4Pyro_dmg_ = greaterEq(input.artSet.CrimsonWitchOfFlames, 4,
  lookup(condStack,
    Object.fromEntries(stackArr.map(i => [i, percent(0.15 * i / 2)]))
    , naught),
  pyro_dmg_info)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    pyro_dmg_: sum(set2, set4Pyro_dmg_),
    overloaded_dmg_: set4Overload,
    burning_dmg_: set4Burning,
    vaporize_dmg_: set4Vape,
    melt_dmg_: set4Melt,
    burgeon_dmg_: set4Burgeon,
  },
})

const sheet: IArtifactSheet = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{
          node: set4Overload,
        }, {
          node: set4Burning,
        }, {
          node: set4Burgeon,
        }, {
          node: set4Vape,
        }, {
          node: set4Melt,
        }],
      }, {
        header: setHeader(4),
        value: condStack,
        path: condStackPath,
        name: st("afterUse.skill"),
        states: Object.fromEntries(stackArr.map(i => [i, {
          name: st("stack", { count: i }),
          fields: [{ node: set4Pyro_dmg_ }]
        }]))
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
