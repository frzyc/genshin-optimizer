import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact_WR'
import { Data } from '../../../Formula/type'
import { infoMut, min, percent, prod, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { dataObjForArtifactSheet } from '../../../Formula/api'
import { ArtifactSetKey } from '../../../Types/consts'
const setKey: ArtifactSetKey = "EmblemOfSeveredFate"

const set2 = threshold_add(input.artSet.EmblemOfSeveredFate, 2, percent(0.2))

const burstBonus = threshold_add(input.artSet.EmblemOfSeveredFate, 4,
  min(percent(0.75), prod(percent(0.25), input.premod.enerRech_)))

export const data: Data = dataObjForArtifactSheet(setKey, {
  premod: {
    enerRech_: set2
  },
  total: {
    dmgBonus: {
      burst: burstBonus
    }
  }
}, {
  burstBonus
})

const artifact: IArtifactSheet = {
  name: "Emblem of Severed Fate", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
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
export default artifact
