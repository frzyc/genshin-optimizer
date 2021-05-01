import flower from './Item_Stainless_Bloom.png'
import plume from './Item_Wise_Doctor\'s_Pinion.png'
import sands from './Item_Moment_of_Cessation.png'
import goblet from './Item_Surpassing_Cup.png'
import circlet from './Item_Mocking_Mask.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'

const conditionals: IConditionals = {
  set4: {
    name: "Elemental Skill hits an opponent",
    states: {
      s1: {
        name: "1 Stack",
        stats: { atk_: 9 },
        fields: [{
          text: "Duration",
          value: "7s"
        }]
      },
      s2: {
        name: "2 Stacks",
        stats: { atk_: 18, physical_dmg_: 25 },
        fields: [{
          text: "Duration",
          value: "7s"
        }]
      }
    },
  }
}
const artifact: IArtifactSheet = {
  name: "Pale Flame", rarity: [4, 5],
  pieces: {
    flower: "Stainless Bloom",
    plume: "Wise Doctor's Pinion",
    sands: "Moment of Cessation",
    goblet: "Surpassing Cup",
    circlet: "Mocking Mask"
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
      text: "Physical DMG +25%",
      stats: { physical_dmg_: 25 }
    },
    4: {
      text: "When an Elemental Skill hits an opponent, ATK is increased by 9% for 7s. This effect stacks up to 2 times and can be triggered once every 0.3s. Once 2 stacks are reached, the 2-set effect is increased by 100%.",
      conditional: conditionals.set4
    }
  }
}
export default artifact