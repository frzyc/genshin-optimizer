import CalculatedStats from "../Build/CalculatedStatsInterface";
import Conditional, { ConditionalComplex, Conditionals } from "../Conditional/Conditionalnterface";

export default interface ArtifactSheet {
  name: string,
  rarity: Array<number>,
  pieces: {
    [key: string]: string
  },
  icons: {
    [key: string]: string
  },
  conditionals?: Conditionals
  setEffects: {
    [key: string]: {
      text: string | JSX.Element | ((stats: CalculatedStats) => string | JSX.Element)
      stats?: object
      conditional?: Conditional | ConditionalComplex
      conditionals?: Conditionals
    }
  }
}