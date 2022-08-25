import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "ThunderingFury"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.ThunderingFury, 2, percent(0.15))
const overloaded_dmg_ = greaterEq(input.artSet.ThunderingFury, 4, percent(0.40))
const electrocharged_dmg_ = { ...overloaded_dmg_ }
const superconduct_dmg_ = { ...overloaded_dmg_ }
const hyperbloom_dmg_ = { ...overloaded_dmg_ }
const aggravate_dmg_ = greaterEq(input.artSet.ThunderingFury, 4, percent(0.20))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    electro_dmg_: set2,
    overloaded_dmg_,
    electrocharged_dmg_,
    superconduct_dmg_,
    hyperbloom_dmg_,
    aggravate_dmg_
  },
})

const sheet: IArtifactSheet = {
  name: "Thundering Fury", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{
          node: overloaded_dmg_,
        }, {
          node: electrocharged_dmg_,
        }, {
          node: superconduct_dmg_,
        }, {
          node: hyperbloom_dmg_,
        }, {
          node: aggravate_dmg_,
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
