import flower from './Item_Gladiator\'s_Nostalgia.png'
import plume from './Item_Gladiator\'s_Destiny.png'
import sands from './Item_Gladiator\'s_Longing.png'
import goblet from './Item_Gladiator\'s_Intoxication.png'
import circlet from './Item_Gladiator\'s_Triumphus.png'
import { IConditionals } from '../../../Conditional/IConditional'
import IArtifactSheet from '../../../Artifact/IArtifactSheet'
const conditionals: IConditionals = {
  set4: {
    name: "Owner uses a Melee weapon",
    stats: { normal_dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
  name: "Gladiator's Finale", rarity: [4, 5],
  pieces: {
    flower: "Gladiator's Nostalgia",
    plume: "Gladiator's Destiny",
    sands: "Gladiator's Longing",
    goblet: "Gladiator's Intoxication",
    circlet: "Gladiator's Triumphus"
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
      text: "ATK +18%",
      stats: { atk_: 18 }
    },
    4: {
      text: "If the wielder of this artifact set uses a Sword, Claymore or Polearm, increases their Normal Attack DMG by 35%.",
      conditional: conditionals.set4
    }
  }
}
export default artifact