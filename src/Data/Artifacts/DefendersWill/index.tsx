import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { Translate } from '../../../Components/Translate'
import ImgIcon from '../../../Components/Image/ImgIcon'
import SqBadge from '../../../Components/SqBadge'
import { allElements } from '../../../Types/consts'
import { sgt } from '../../Characters/SheetUtil'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="artifact_DefendersWill_gen" key18={strKey} />
const artifact: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { def_: 30 }
    },
    4: {
      document: allElements.map(ele => ({
        conditional: {
          key: ele,
          partyBuff: "partyAll",
          header: {
            title: tr("setName"),
            icon: <ImgIcon size={2} sx={{ m: -1 }} src={flower} />,
            action: <SqBadge color="success">4-set</SqBadge>
          },
          description: tr(`setEffects.4`),
          canShow: stats => [stats.characterEle, ...stats.teamStats.map(t => t?.characterEle ?? "")].includes(ele),
          maxStack: 0,
          name: <span><ColorText color={ele}>{sgt(`element.${ele}`)}</ColorText> character in party</span>,
          stats: { [`${ele}_res_`]: 30 }
        }
      }))
    }
  }
}
export default artifact