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
  name: "Emblem of Severed Fate", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
    setEffects: {
    2: {
      stats: { enerRech_: 20 }
    },
    4: {
      stats: {
        modifiers: { burst_dmg_: [path.s4()] },
      },
      document: [{
        fields: [{
          text: "Elemental Burst DMG",
          formulaText: stats => <span>min ( 25% * {Stat.printStat("enerRech_", stats, true)} , 75% )</span>,
          formula: formula.s4,
          fixed: 1,
          unit: "%"
        }]
      }]
    }
  }
}
export default artifact