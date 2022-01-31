import { UIData } from "../Formula/uiData";
import IConditional from "./IConditional_WR";
import { IFieldDisplay } from "./IFieldDisplay_WR";

export interface DocumentSection {
  canShow?: (data: UIData) => boolean
  text?: Displayable | ((data: UIData) => Displayable)
  fields?: IFieldDisplay[]
  conditional?: IConditional
}
