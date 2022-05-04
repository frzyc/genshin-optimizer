import { NumNode, ReadNode } from "../Formula/type";
import { UIData } from "../Formula/uiData";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "./consts";
import { IFieldDisplay } from "./IFieldDisplay";

interface IDocumentBase {
  canShow?: NumNode
  teamBuff?: boolean
  header?: IDocumentHeader
}

export interface IDocumentHeader {
  title: Displayable
  icon: Displayable | ((data: UIData) => Displayable)
  action?: Displayable
  description?: Displayable | ((data: UIData) => Displayable)
}

export interface IDocumentText extends IDocumentBase {
  text?: Displayable | ((data: UIData) => Displayable)
}

export interface IDocumentConditionalBase extends IDocumentBase {
  path: readonly string[]
  value: ReadNode<string>
  name: Displayable
  states: {
    [key: string]: {
      name?: Displayable
      fields: IFieldDisplay[]
    }
  }
}
export interface IDocumentConditional extends IDocumentConditionalBase {
  header: IDocumentHeader
}
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<Record<Keys, { [key: string]: string }>>

export interface IDocumentFields extends IDocumentText {
  fields: IFieldDisplay[]
}

export type DocumentSection = IDocumentText | IDocumentConditional | IDocumentFields
