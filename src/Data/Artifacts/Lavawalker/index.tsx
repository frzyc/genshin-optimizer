import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, equal } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond } from '../../SheetUtil'
import ColorText from '../../../Components/ColoredText'

const key: ArtifactSetKey = "Lavawalker"

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.Lavawalker, 2, percent(0.40))
const set4 = greaterEq(input.artSet.Lavawalker, 4, equal("on", condState, percent(0.35)))

// TODO: Is it all_dmg_?
export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    pyro_res_: set2,
    all_dmg_: set4
  },
})

const sheet: IArtifactSheet = {
  name: "Lavawalker", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          value: condState,
          path: condStatePath,
          name: <span>Enemies that are <ColorText color="burning">Burning</ColorText> or affected by <ColorText color="pyro">Pyro</ColorText></span>,
          states: {
            on: {
              fields: [{
                node: set4,
              }]
            },
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
