import flower from './Item_Traveling_Doctor\'s_Silver_Lotus.png'
import plume from './Item_Traveling_Doctor\'s_Owl_Feather.png'
import sands from './Item_Traveling_Doctor\'s_Pocket_Watch.png'
import goblet from './Item_Traveling_Doctor\'s_Medicine_Pot.png'
import circlet from './Item_Traveling_Doctor\'s_Handkerchief.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import { TransWrapper } from '../../../Components/Translate'
import formula from './data'
import Stat from '../../../Stat'
const conditionals: IConditionals = {
  4: {
    name: <span>Using Elemental Burst</span>,
    fields: [{
      text: <TransWrapper ns="sheet_gen" key18="healing" />,
      formulaText: stats => <span>20% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.regen,
      variant: "success"
    }]
  }
}
const artifact: IArtifactSheet = {
  name: "Traveling Doctor", rarity: [3],
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
      stats: { incHeal_: 20 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact