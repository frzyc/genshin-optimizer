import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { Translate } from '../../../Components/Translate'
import formula from './data'
import Stat from '../../../Stat'
const artifact: IArtifactSheet = {
  name: "Traveling Doctor", rarity: [3],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { incHeal_: 20 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: <span>Using Elemental Burst</span>,
          fields: [{
            text: <Translate ns="sheet_gen" key18="healing" />,
            formulaText: stats => <span>20% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.regen,
            variant: "success"
          }]
        }
      }]
    }
  }
}
export default artifact