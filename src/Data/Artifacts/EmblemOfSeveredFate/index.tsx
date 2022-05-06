import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, min, percent, prod } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "EmblemOfSeveredFate"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.EmblemOfSeveredFate, 2, percent(0.2))

const burstBonus = greaterEq(input.artSet.EmblemOfSeveredFate, 4,
  min(percent(0.75), prod(percent(0.25), input.premod.enerRech_)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2,
    burst_dmg_: burstBonus,
  },
}, {
  burstBonus,
})

const sheet: IArtifactSheet = {
  name: "Emblem of Severed Fate", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{
          node: burstBonus,
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
