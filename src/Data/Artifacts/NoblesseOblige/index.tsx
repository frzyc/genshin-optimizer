import icons from './icons'
import { Translate } from '../../../Components/Translate'
import ImgIcon from '../../../Components/Image/ImgIcon'
import SqBadge from '../../../Components/SqBadge'
import { sgt } from '../../Characters/SheetUtil'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { ArtifactSetKey } from '../../../Types/consts'
import { customRead, match, percent, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond } from '../../SheetUtil'

const key: ArtifactSetKey = "NoblesseOblige"

const tr = (strKey: string) => <Translate ns={`artifact_${key}_gen`} key18={strKey} />

const set2 = threshold_add(input.artSet.NoblesseOblige, 2, percent(0.2))

const [condSet4Path, condSet4] = cond(key, "set4")
const set4TallyWrite = threshold_add(input.artSet.NoblesseOblige, 4, match(condSet4, "on", 1))
const set4TallyRead = customRead(["tally", "NO4"])
const set4 = threshold_add(set4TallyRead, 1, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    burst_dmg_: set2,
    atk_: set4,
  },
  teamBuff: {
    tally: {
      NO4: set4TallyWrite
    }
  }
})

const sheet: IArtifactSheet = {
  name: "Noblesse Oblige", rarity: [4, 5],
  icons,
  setEffects: {
    2: {
      document: [{ fields: [{ node: set2 }] }]
    },
    4: {
      document: [{
        conditional: {
          teamBuff: true,
          value: condSet4,
          path: condSet4Path,
          header: {
            title: tr("setName"),
            icon: <ImgIcon size={2} sx={{ m: -1 }} src={icons.flower} />,
            action: <SqBadge color="success">4-set</SqBadge>
          },
          description: tr(`setEffects.4`),
          name: <Translate ns="artifact_NoblesseOblige" key18="condName" />,
          states: {
            on: {
              fields: [{
                node: set4
              }, {
                text: sgt("duration"),
                value: 12,
                unit: "s"
              }]
            }
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
