import flower from './Item_Magnificent_Tsuba.png'
import plume from './Item_Sundered_Feather.png'
import sands from './Item_Storm_Cage.png'
import goblet from './Item_Scarlet_Vessel.png'
import circlet from './Item_Ornate_Kabuto.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'
import { FormulaPathBase } from '../../formula'
import formula from './data'
import { KeyPath } from '../../../Util/KeyPathUtil'
import Stat from '../../../Stat'

const path = KeyPath<FormulaPathBase>().artifact.EmblemOfSeveredFate

const conditionals: IConditionals = {
  4: {
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