import flower from './Item_Tenacity_of_the_Millelith_Flower.png'
import plume from './Item_Tenacity_of_the_Millelith_Flower.png'
import sands from './Item_Tenacity_of_the_Millelith_Flower.png'
import goblet from './Item_Tenacity_of_the_Millelith_Flower.png'
import circlet from './Item_Tenacity_of_the_Millelith_Flower.png'
import { IConditionals } from '../../../Conditional/IConditional'
import IArtifactSheet from '../../../Artifact/IArtifactSheet'
const conditionals: IConditionals = {
  set4: {
    name: "Elemental Skill hits an opponent",
    stats: { atk_: 20, powShield_: 30 }
  }
}
const artifact: IArtifactSheet = {
  name: "Tenacity of the Millelith", rarity: [4, 5],
  pieces: {
    flower: "Flower of Accolades",
    plume: "Ceremonial War-Plume",
    sands: " Orichalceous Time-Dial",
    goblet: "Noble's Pledging Vessel",
    circlet: "General's Ancient Helm"
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
      text: "HP +20%",
      stats: { hp_: 20 }
    },
    4: {
      text: "When an Elemental Skill hits an opponent, the ATK of all nearby party members is increased by 20% and their Shield Strength is increased by 30% for 3s. This effect can be triggered once every 0.5s. This effect can still be triggered even when the character who is using this artifact set is not on the field.",
      conditional: conditionals.set4
    }
  }
}
export default artifact