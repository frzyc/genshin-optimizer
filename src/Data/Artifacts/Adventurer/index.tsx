import flower from './Item_Adventurer\'s_Flower.png'
import plume from './Item_Adventurer\'s_Tail_Feather.png'
import sands from './Item_Adventurer\'s_Pocket_Watch.png'
import goblet from './Item_Adventurer\'s_Golden_Goblet.png'
import circlet from './Item_Adventurer\'s_Bandana.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { TransWrapper } from '../../../Components/Translate'
import formula from './data'
import Stat from '../../../Stat'
const artifact: IArtifactSheet = {
  name: "Adventurer", rarity: [3],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: { stats: { hp: 1000 } },
    4: {
      document: [{
        fields: [{
          text: <TransWrapper ns="sheet_gen" key18="healing" />,
          formulaText: stats => <span>30% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.regen,
          variant: "success"
        }]
      }]
    }
  }
}
export default artifact

