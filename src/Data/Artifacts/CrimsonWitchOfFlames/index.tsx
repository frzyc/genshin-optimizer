import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import sands from './Item_Witch\'s_End_Time.png'
import plume from './Item_Witch\'s_Ever-Burning_Plume.png'
import flower from './Item_Witch\'s_Flower_of_Blaze.png'
import goblet from './Item_Witch\'s_Heart_Flames.png'
import circlet from './Item_Witch\'s_Scorching_Hat.png'
const conditionals: IConditionals = {
  4: {
    name: "Using an Elemental Skill",
    maxStack: 3,
    stats: { pyro_dmg_: 7.5 }
  }
}
const artifact: IArtifactSheet = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
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
      stats: { pyro_dmg_: 15 }
    },
    4: {
      stats: {
        overloaded_dmg_: 40,
        burning_dmg_: 40,
        vaporize_dmg_: 15,
        melt_dmg_: 15,
      },
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact