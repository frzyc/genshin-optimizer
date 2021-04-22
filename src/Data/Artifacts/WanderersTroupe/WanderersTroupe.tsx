import flower from './Item_Troupe\'s_Dawnlight.png'
import plume from './Item_Bard\'s_Arrow_Feather.png'
import sands from './Item_Concert\'s_Final_Hour.png'
import goblet from './Item_Wanderer\'s_String_Kettle.png'
import circlet from './Item_Conductor\'s_Top_Hat.png'
import IArtifactSheet from '../../../Artifact/IArtifactSheet'
import { IConditionals } from '../../../Conditional/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "Character uses a ranged weapon",
    stats: { charged_dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
  name: "Wanderer's Troupe", rarity: [4, 5],
  pieces: {
    flower: "Troupe's Dawnlight",
    plume: "Bard's Arrow Feather",
    sands: "Concert's Final Hour",
    goblet: "Wanderer's String-Kettle",
    circlet: "Conductor's Top Hat"
  },
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  conditionals,
  setEffects: {
    2: {
      text: "Elemental Mastery +80",
      stats: {
        eleMas: 80
      }
    },
    4: {
      text: "Increases Charged Attack DMG by 35% if the character uses a Catalyst or Bow.",
      conditional: conditionals.set4
    }
  }
}
export default artifact