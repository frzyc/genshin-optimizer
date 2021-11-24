import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { sgt } from '../../Characters/SheetUtil'
import { Translate } from '../../../Components/Translate'
import SqBadge from '../../../Components/SqBadge'
import ImgIcon from '../../../Components/Image/ImgIcon'
const tr = (strKey: string) => <Translate ns="artifact_Instructor_gen" key18={strKey} />
const artifact: IArtifactSheet = {
  name: "Instructor", rarity: [3, 4],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { eleMas: 80 }
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
          name: <Translate ns="artifact_Instructor" key18="condName" />,
          stats: { eleMas: 120 },
          fields: [{
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        }
      }]
    }
  }
}
export default artifact