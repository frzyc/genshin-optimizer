import flower from './Item_In_Remembrance_of_Viridescent_Fields.png'
import plume from './Item_Viridescent_Arrow_Feather.png'
import sands from './Item_Viridescent_Venerer\'s_Determination.png'
import goblet from './Item_Viridescent_Venerer\'s_Vessel.png'
import circlet from './Item_Viridescent_Venerer\'s_Diadem.png'
import ElementalData from '../../ElementalData'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "Element Swirled",
    states: Object.fromEntries(Object.entries(ElementalData).filter(([key]) => key !== "anemo" && key !== "geo" && key !== "physical").map(([key, { name }]) => [key, {
      name: <span className={`text-${key}`}>{name}</span>,
      stats: { [`${key}_enemyRes_`]: -40 }//TODO: this is most likely a team effect.
    }]))
  }
}
const artifact: IArtifactSheet = {
  name: "Viridescent Venerer", rarity: [4, 5], pieces: {
    flower: "In Remembrance of Viridescent Fields",
    plume: "Viridescent Arrow Feather",
    sands: "Viridescent Venerer's Determination",
    goblet: "Viridescent Venerer's Vessel",
    circlet: "Viridescent Venerer's Diadem"
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
      text: <span><span className="text-anemo">Anemo DMG Bonus</span> +15%</span>,
      stats: { anemo_dmg_: 15 }
    },
    4: {
      text: "Increases Swirl DMG by 60%. Decreases opponent's Elemental RES to the element infused in the Swirl by 40% for 10s.",
      stats: { swirl_dmg_: 60 },
      conditional: conditionals.set4
    }
  }
}
export default artifact