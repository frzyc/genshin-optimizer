import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { sgt } from '../../Characters/SheetUtil'
import ImgIcon from '../../../Components/Image/ImgIcon'
import SqBadge from '../../../Components/SqBadge'
import { Translate } from '../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="artifact_MaidenBeloved_gen" key18={strKey} />
const artifact: IArtifactSheet = {
  name: "Maiden Beloved", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { heal_: 15 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          partyBuff: "partyAll",
          header: {
            title: tr("setName"),
            icon: <ImgIcon size={2} sx={{ m: -1 }} src={flower} />,
            action: <SqBadge color="success">4-set</SqBadge>
          },
          description: tr(`setEffects.4`),
          name: <Translate ns="artifact_MaidenBeloved" key18="condName" />,
          stats: { incHeal_: 20 },
          fields: [{
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }
      }]
    }
  }
}
export default artifact