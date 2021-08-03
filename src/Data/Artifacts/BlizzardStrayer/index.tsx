import flower from './Item_Snowswept_Memory.png'
import plume from './Item_Icebreaker\'s_Resolve.png'
import sands from './Item_Frozen_Homeland\'s_Demise.png'
import goblet from './Item_Frost-Weaved_Dignity.png'
import circlet from './Item_Broken_Rime\'s_Echo.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "Attack enemy",
    states: {
      c: {
        name: "Affected By Cryo",
        stats: { critRate_: 20 }
      },
      f: {
        name: "Frozen",
        stats: { critRate_: 40 }
      }
    }
  }
}
const artifact: IArtifactSheet = {//Icebreaker
  name: "Blizzard Strayer", rarity: [4, 5],
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
      stats: { cryo_dmg_: 15 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact