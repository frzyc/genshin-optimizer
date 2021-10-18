import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
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