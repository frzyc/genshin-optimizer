import flower from './Item_In_Remembrance_of_Viridescent_Fields.png'
import plume from './Item_Viridescent_Arrow_Feather.png'
import sands from './Item_Viridescent_Venerer\'s_Determination.png'
import goblet from './Item_Viridescent_Venerer\'s_Vessel.png'
import circlet from './Item_Viridescent_Venerer\'s_Diadem.png'
import ElementalData from '../../ElementalData'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "Element Swirled",
    states: Object.fromEntries(Object.entries(ElementalData).filter(([key]) => key !== "anemo" && key !== "geo" && key !== "physical").map(([key, { name }]) => [key, {
      name: <span className={`text-${key}`}>{name}</span>,
      stats: { [`${key}_enemyRes_`]: -40 }//TODO: this is most likely a team effect.
    }]))
  }
}
const artifact: IArtifactSheet = {
  name: "Viridescent Venerer", rarity: [4, 5], icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  conditionals,
  setEffects: {
    2: {
      stats: { anemo_dmg_: 15 }
    },
    4: {
      stats: { swirl_dmg_: 60 },
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact