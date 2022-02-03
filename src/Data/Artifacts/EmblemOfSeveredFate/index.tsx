import icons from './icons'
import { Data } from '../../../Formula/type'
import { infoMut, min, percent, prod, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = "EmblemOfSeveredFate"

const set2 = threshold_add(input.artSet.EmblemOfSeveredFate, 2, percent(0.2))

const burstBonus = threshold_add(input.artSet.EmblemOfSeveredFate, 4,
  min(percent(0.75), prod(percent(0.25), input.premod.enerRech_)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2,
    dmgBonus: {
      burst: burstBonus,
    },
  },
}, {
  burstBonus,
})

const sheet: IArtifactSheet = {
  name: "Emblem of Severed Fate", rarity: [4, 5],
  icons,
  setEffects: {
    2: {
      document: [{
        fields: [{
          node: infoMut(set2, { key: "enerRech_" }),
        }]
      }]
    },
    4: {
      document: [{
        fields: [{
          node: infoMut(burstBonus, { key: "burst_dmg_" }),
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
