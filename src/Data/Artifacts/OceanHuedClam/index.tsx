import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { FormulaPathBase } from '../../formula'
import formula from './data'
import { KeyPath } from '../../../Util/KeyPathUtil'
import Stat from '../../../Stat'

const path = KeyPath<FormulaPathBase>().artifact.EmblemOfSeveredFate
const artifact: IArtifactSheet = {
  name: "Ocean-Hued Clam", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { heal_: 15 }
    },
    4: {
      stats: {
        modifiers: { burst_dmg_: [path.s4()] },
      },
      document: [{
        fields: [{
          text: "Max Sea-Dyed Foam DMG",
          formulaText: stats => <span>90% * 30000 * {Stat.printStat("physical_enemyRes_multi", stats)}</span>,
          formula: formula.dmg,
          variant: "physical"
        }]
      }]
    }
  }
}
export default artifact