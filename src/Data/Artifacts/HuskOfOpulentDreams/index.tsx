import { input } from '../../../Formula'
import { Data, Info } from '../../../Formula/type'
import { lookup, naught, percent, sum, threshold_add } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "HuskOfOpulentDreams"
const [, trm] = trans("artifact", key)
const [condStackPath, condStack] = cond(key, "stack")
const def_info: Info = { key: "def_" }
const set2 = threshold_add(input.artSet.HuskOfOpulentDreams, 2, percent(0.3), def_info)
const stackArr = range(1, 4)

const set4Def = threshold_add(input.artSet.HuskOfOpulentDreams, 4,
  lookup(condStack,
    Object.fromEntries(stackArr.map(i => [i, percent(0.06 * i)]))
    , naught),
  def_info)
const set4Geo = threshold_add(input.artSet.HuskOfOpulentDreams, 4,
  lookup(condStack,
    Object.fromEntries(stackArr.map(i => [i, percent(0.06 * i)]))
    , naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: sum(set2, set4Def),
    geo_dmg_: set4Geo,
  },
})

const sheet: IArtifactSheet = {
  name: "Husk of Opulent Dreams", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          value: condStack,
          path: condStackPath,
          name: trm("condName"),
          states: Object.fromEntries(stackArr.map(i => [i, {
            name: i.toString(),
            fields: [{ node: set4Def }, {
              node: set4Geo
            }]
          }]))
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
