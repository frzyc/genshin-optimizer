import { BonusStats, BasicStats } from "./stats";
import { IFieldDisplay } from "./IFieldDisplay_WR";
import { ReadNode, NumNode, StrNode } from "../Formula/type";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "./consts";

export default interface IConditional {
  path: string[],
  value: ReadNode<string>,
  name: Displayable;
  header?: {
    title: Displayable;
    icon?: Displayable;
    action?: Displayable;
  }
  description?: Displayable;
  canShow?: NumNode | StrNode;
  states: {
    [key: string]: {
      name?: Displayable,
      fields: IFieldDisplay[]
    }
  }
}
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<Record<Keys, { [key: string]: string }>>
