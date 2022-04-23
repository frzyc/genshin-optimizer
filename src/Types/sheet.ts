import { UIData } from "../Formula/uiData";
import IConditional from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";

export interface DocumentSection {
  canShow?: (data: UIData) => boolean
  text?: Displayable | ((data: UIData) => Displayable)
  fieldsHeader?: {
    title: Displayable;
    icon?: Displayable | ((data: UIData) => Displayable);
    action?: Displayable;
  }
  fields?: IFieldDisplay[]
  conditional?: IConditional
  teamBuff?: boolean
}
