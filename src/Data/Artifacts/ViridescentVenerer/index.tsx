import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
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