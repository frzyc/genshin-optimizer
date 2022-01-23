import { BonusStats, BasicStats } from "./stats";
import { IFieldDisplay } from "./IFieldDisplay_WR";
import { Node } from "../Formula/type";

export default interface IConditional {
  path: string[],
  value: StringReadNode,
  name: Displayable;
  header?: {
    title: Displayable;
    icon?: Displayable;
    action?: Displayable;
  }
  description?: Displayable;
  canShow?: Node;
  states: {
    [key: string]: {
      name?: Displayable,
      fields: IFieldDisplay[]
    }
  }
}
