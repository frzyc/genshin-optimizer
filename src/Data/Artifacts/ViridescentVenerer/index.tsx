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
import { absorbableEle } from '../../Characters/dataUtil'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="artifact_ViridescentVenerer_gen" key18={strKey} />
const artifact: IArtifactSheet = {
  name: "Viridescent Venerer", rarity: [4, 5], icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { anemo_dmg_: 15 }
    },
    4: {
      stats: { swirl_dmg_: 60 },
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
          name: <Translate ns="artifact_ViridescentVenerer" key18="condName" />,
          states: Object.fromEntries(absorbableEle.map(ele => [ele, {
            name: <ColorText color={ele}>{sgt(`element.${ele}`)}</ColorText>,
            stats: { [`${ele}_enemyRes_`]: -40 },
            fields: [{
              text: sgt("duration"),
              value: 10,
              unit: "s"
            }]
          }]))
        }
      }]
    }
  }
}
export default artifact