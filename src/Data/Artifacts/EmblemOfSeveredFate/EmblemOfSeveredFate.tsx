import flower from './Item_Magnificent_Tsuba.png'
import plume from './Item_Sundered_Feather.png'
import sands from './Item_Storm_Cage.png'
import goblet from './Item_Scarlet_Vessel.png'
import circlet from './Item_Ornate_Kabuto.png'
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
  name: "Emblem of Severed Fate", rarity: [4, 5],
  pieces: {
    flower: "Magnificent Tsuba",
    plume: "Sundered Feather",
    sands: "Storm Cage",
    goblet: "Scarlet Vessel",
    circlet: "Ornate Kabuto"
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
      text: "Energy Recharge +20%",
      stats: { enerRech_: 20 }
    },
    4: {
      text: <span>Increases Elemental Burst DMG by 25% of Energy Recharge. A maximum of 75% bonus DMG can be obtained in this way. <small className="text-danger"><strong>Caution:</strong> this bonus is not currently applied in character/builer. You need to manually add the Ele. Burst DMG in Character Editor.</small></span>,
      stats: {
        modifiers: { burst_dmg_: { enerRech_: 0.25, } },
      }
    }
  }
}
export default artifact