import { BonusStats, BasicStats } from "./stats";
import { IFieldDisplay } from "./IFieldDisplay_WR";
import { ReadNode, NumNode, StrNode } from "../Formula/type";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "./consts";
import { UIData } from "../Formula/uiData";

export default interface IConditional {
  path: readonly string[],
  value: ReadNode<string>,
  teamBuff?: boolean,
  name: Displayable;
  header?: {
    title: Displayable;
    icon?: Displayable | ((data: UIData) => Displayable);
    action?: Displayable;
  }
  description?: Displayable | ((data: UIData) => Displayable);
  canShow?: NumNode | StrNode;
  states: {
    [key: string]: {
      name?: Displayable,
      fields: readonly IFieldDisplay[]
    }
  }
}
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<Record<Keys, { [key: string]: string }>>
