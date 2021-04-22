import ICalculatedStats from "../Build/ICalculatedStats";
import IConditional, { IConditionalComplex, IConditionals } from "../Conditional/IConditional";

export default interface IArtifactSheet {
  name: string,
  rarity: Array<number>,
  pieces: {
    [key: string]: string
  },
  icons: {
    [key: string]: string
  },
  conditionals?: IConditionals
  setEffects: {
    [key: string]: {
      text: string | JSX.Element | ((stats: ICalculatedStats) => string | JSX.Element)
      stats?: object
      conditional?: IConditional | IConditionalComplex
      conditionals?: IConditionals
    }
  }
}