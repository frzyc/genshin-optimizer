import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { absorbableEle, ArtifactSetKey } from '../../../Types/consts'
import { objectKeyMap, objectKeyValueMap } from '../../../Util/Util'
import { condReadNode, sgt, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "ViridescentVenerer"
const setHeader = setHeaderTemplate(key, icons)

const anemo_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 2, percent(0.15))
const swirl_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 4, percent(0.6))

const condSwirlPaths = objectKeyMap(absorbableEle, e => [key, `swirl${e}`])
const condSwirls = objectKeyMap(absorbableEle, e => condReadNode(condSwirlPaths[e]))

const condSwirlNodes = objectKeyValueMap(absorbableEle, e => [`${e}_enemyRes_`,
greaterEq(input.artSet.ViridescentVenerer, 4,
  equal(e, condSwirls[e], percent(-0.4))
)])

const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    anemo_dmg_,
    swirl_dmg_,
  },
  teamBuff: {
    premod: {
      ...condSwirlNodes
    }
  }
})

const sheet: IArtifactSheet = {
  name: "Viridescent Venerer", rarity: [4, 5], icons,
  setEffects: {
    2: {
      document: [{
        header: setHeader(2),
        fields: [{ node: anemo_dmg_ }]
      }]
    },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{ node: swirl_dmg_ }],
      }, {
        header: setHeader(4),
        teamBuff: true,
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          value: condSwirls[eleKey],
          path: condSwirlPaths[eleKey],
          name: st(`swirlReaction.${eleKey}`),
          fields: [{
            node: condSwirlNodes[`${eleKey}_enemyRes_`]
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }]))
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
