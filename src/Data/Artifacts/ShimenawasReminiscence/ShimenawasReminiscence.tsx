import flower from './Item_Entangling_Bloom.png'
import plume from './Item_Shaft_of_Remembrance.png'
import sands from './Item_Morning_Dew\'s_Moment.png'
import goblet from './Item_Hopeful_Heart.png'
import circlet from './Item_Capricious_Visage.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'

const conditionals: IConditionals = {
  set4: {
    name: "After using 15 energy",
    stats: {
      normal_dmg_: 50,
      charged_dmg_: 50,
      plunging_dmg_: 50,
    }
  }
}
const artifact: IArtifactSheet = {
  name: "Shimenawa's Reminiscence", rarity: [4, 5],
  pieces: {
    flower: "Entangling Bloom",
    plume: "Shaft of Remembrance",
    sands: "Morning Dew's Moment",
    goblet: "Hopeful Heart",
    circlet: "Capricious Visage"
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
      text: "ATK +18%.",
      stats: { atk_: 18 }
    },
    4: {
      text: "When casting an Elemental Skill, if the character has 15 or more Energy, they lose 15 Energy and Normal/Charged/ Plunging Attack DMG is increased by 50% for 10s.",
      conditional: conditionals.set4
    }
  }
}
export default artifact