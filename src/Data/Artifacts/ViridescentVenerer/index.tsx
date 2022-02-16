import icons from './icons'
import ImgIcon from '../../../Components/Image/ImgIcon'
import SqBadge from '../../../Components/SqBadge'
import { sgt } from '../../Characters/SheetUtil'
import { absorbableEle } from '../../Characters/dataUtil'
import ColorText from '../../../Components/ColoredText'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { ArtifactSetKey } from '../../../Types/consts'
import { dataObjForArtifactSheet } from '../dataUtil'
import { Data } from '../../../Formula/type'
import { equal, percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import elementalData from '../../ElementalData'
import { objectKeyMap, objectKeyValueMap } from '../../../Util/Util'
import { condReadNode, st, trans } from '../../SheetUtil'

const key: ArtifactSetKey = "ViridescentVenerer"
const [tr] = trans("artifact", key)

const anemo_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 2, percent(0.15))
const swirl_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 4, percent(0.6))

const condSwirlPaths = objectKeyMap(absorbableEle, e => [key, `swirl${e}`])
const condSwirls = objectKeyMap(absorbableEle, e => condReadNode(condSwirlPaths[e]))

const condSwirlNodes = objectKeyValueMap(absorbableEle, e => [`${e}_enemyRes_`,
greaterEq(input.artSet.ViridescentVenerer, 4,
  equal("swirl", condSwirls[e], percent(-0.4))
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
        fields: [{ node: anemo_dmg_ }]
      }]
    },
    4: {
      document: [{
        fields: [{ node: swirl_dmg_ }],
      },
      ...absorbableEle.map(eleKey => ({
        conditional: { // Poetics of Fuubutsu
          value: condSwirls[eleKey],
          path: condSwirlPaths[eleKey],
          teamBuff: true,
          header: {
            title: tr("setName"),
            icon: <ImgIcon size={2} sx={{ m: -1 }} src={icons.flower} />,
            action: <SqBadge color="success">4-set</SqBadge>
          },
          description: tr(`setEffects.4`),
          name: st("eleSwirled"),
          states: {
            swirl: {
              name: <ColorText color={eleKey}>{elementalData[eleKey].name}</ColorText>,
              fields: [{
                node: condSwirlNodes[`${eleKey}_enemyRes_`]
              }, {
                text: sgt("duration"),
                value: 10,
                unit: "s"
              }]
            }
          }
        },
      }))
      ]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
