import { NumNode, ReadNode } from "../Formula/type";
import { UIData } from "../Formula/uiData";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "./consts";
import { IFieldDisplay } from "./fieldDisplay";

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

interface IDocumentConditionalExclusiveBase extends IDocumentBase {
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
interface IDocumentConditionalMultipleBase extends IDocumentBase {
  states: {
    [key: string]: {
      path: readonly string[]
      value: ReadNode<string>
      name: Displayable
      fields: IFieldDisplay[]
    }
  }
}
export type DocumentConditionalBase = IDocumentConditionalExclusiveBase | IDocumentConditionalMultipleBase
export interface IDocumentConditionalExclusive extends IDocumentConditionalExclusiveBase {
  header: IDocumentHeader
}
export interface IDocumentConditionalMultiple extends IDocumentConditionalMultipleBase {
  header: IDocumentHeader
}
export type DocumentConditional = IDocumentConditionalExclusive | IDocumentConditionalMultiple
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<Record<Keys, { [key: string]: string }>>
// export type ConditionalStateType = "exclusive" | "multiple"

export interface IDocumentFields extends IDocumentText {
  fields: IFieldDisplay[]
}

export type DocumentSection = IDocumentText | DocumentConditional | IDocumentFields
