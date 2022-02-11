import icons from './icons'
import { Data, Info } from '../../../Formula/type'
import { lookup, naught, percent, sum, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, trans } from '../../SheetUtil'
import { st } from '../../Characters/SheetUtil'
import { range } from '../../../Util/Util'

const key: ArtifactSetKey = "CrimsonWitchOfFlames"
const [, trm] = trans("artifact", key)
const [condStackPath, condStack] = cond(key, "stack")
const pyro_dmg_info: Info = { key: "pyro_dmg_", variant: "pyro" }
const set2 = threshold_add(input.artSet.CrimsonWitchOfFlames, 2, percent(0.15), pyro_dmg_info)
const set4Overload = threshold_add(input.artSet.CrimsonWitchOfFlames, 4, percent(0.4))
const set4Burning = { ...set4Overload }
const set4Vape = threshold_add(input.artSet.CrimsonWitchOfFlames, 4, percent(0.15))
const set4Melt = { ...set4Vape }
const set4Pyro_dmg_ = threshold_add(input.artSet.CrimsonWitchOfFlames, 4,
  lookup(condStack,
    Object.fromEntries(range(1, 3).map(i => [i, percent(0.15 * i / 2)]))
    , naught),
  pyro_dmg_info)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    pyro_dmg_: sum(set2, set4Pyro_dmg_),
    overloaded_dmg_: set4Overload,
    burning_dmg_:set4Burning,
    vaporize_dmg_: set4Vape,
    melt_dmg_: set4Melt,
  },
})

const sheet: IArtifactSheet = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
  icons,
  setEffects: {
    2: {
      document: [{
        fields: [{
          node: set2
        }]
      }]
    },
    4: {
      document: [{
        fields: [{
          node: set4Overload,
        }, {
          node: set4Burning,
        }, {
          node: set4Vape,
        }, {
          node: set4Melt,
        }],
        conditional: {
          value: condStack,
          path: condStackPath,
          name: st("afterUse.skill"),
          states: Object.fromEntries(range(1, 3).map(i => [i, {
            name: i.toString(),
            fields: [{ node: set4Pyro_dmg_ }]
          }]))
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
