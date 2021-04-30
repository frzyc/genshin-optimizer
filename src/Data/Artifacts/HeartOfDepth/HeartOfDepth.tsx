import flower from './Item_Gilded_Corsage.png'
import plume from './Item_Gust_of_Nostalgia.png'
import sands from './Item_Copper_Compass.png'
import goblet from './Item_Goblet_of_Thundering_Deep.png'
import circlet from './Item_Wine-Stained_Tricorne.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "After using Elemental Skill",
    stats: {
      normal_dmg_: 30,
      charged_dmg_: 30
    }
  }
}
const artifact: IArtifactSheet = {//Ocean Conqueror
  name: "Heart of Depth", rarity: [4, 5],
  pieces: {
    flower: "Gilded Corsage",
    plume: "Gust of Nostalgia",
    sands: "Copper Compass",
    goblet: "Goblet of Thundering Deep",
    circlet: "Wine-Stained Tricorne"
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
      text: <span><span className="text-hydro">Hydro DMG Bonus</span> +15%</span>,
      stats: { hydro_dmg_: 15 }
    },
    4: {
      text: "After using Elemental Skill, increases Normal Attack and Charged Attack DMG by 30% for 15s",
      conditional: conditionals.set4
    }
  }
}
export default artifact