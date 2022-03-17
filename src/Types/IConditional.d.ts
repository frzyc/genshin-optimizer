import { NumNode, ReadNode, StrNode } from "../Formula/type";
import { UIData } from "../Formula/uiData";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "./consts";
import { IFieldDisplay } from "./IFieldDisplay";

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
      fields?: readonly IFieldDisplay[]
    }
  }
}
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<Record<Keys, { [key: string]: string }>>
