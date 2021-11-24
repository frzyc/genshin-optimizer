import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { Translate } from '../../../Components/Translate'
import ImgIcon from '../../../Components/Image/ImgIcon'
import SqBadge from '../../../Components/SqBadge'
import { sgt } from '../../Characters/SheetUtil'
const tr = (strKey: string) => <Translate ns="artifact_TenacityOfTheMillelith_gen" key18={strKey} />
const artifact: IArtifactSheet = {
  name: "Tenacity of the Millelith", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { hp_: 20 }
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
          name: <Translate ns="artifact_TenacityOfTheMillelith" key18="condName" />,
          stats: { atk_: 20, shield_: 30 },
          fields: [{
            text: sgt("duration"),
            value: 3,
            unit: "s"
          }]
        }
      }]
    }
  }
}
export default artifact