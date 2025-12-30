import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { NumNode, ReadNode } from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'
import type { IFieldDisplay } from './fieldDisplay'

interface IDocumentBase {
  canShow?: NumNode
  teamBuff?: boolean
  header?: IDocumentHeader
}

export interface IDocumentHeader {
  title: ReactNode
  icon: ReactNode | ((data: UIData) => ReactNode)
  action?: ReactNode
  description?: ReactNode | ((data: UIData) => ReactNode)
}

export interface IDocumentText extends IDocumentBase {
  text?: ReactNode | ((data: UIData) => ReactNode)
}

type ExclusiveConditionalStates = {
  [key: string]: {
    name?: ReactNode
    fields: IFieldDisplay[]
  }
}
type MultipleConditionalStates = {
  [key: string]: {
    path: readonly string[]
    value: ReadNode<string>
    name: ReactNode
    fields: IFieldDisplay[]
  }
}

interface IDocumentConditionalExclusiveBase extends IDocumentBase {
  path: readonly string[]
  value: ReadNode<string>
  name: ReactNode
  states:
    | ExclusiveConditionalStates
    | ((data: UIData) => ExclusiveConditionalStates)
}
interface IDocumentConditionalMultipleBase extends IDocumentBase {
  states:
    | MultipleConditionalStates
    | ((data: UIData) => MultipleConditionalStates)
}
export type DocumentConditionalBase =
  | IDocumentConditionalExclusiveBase
  | IDocumentConditionalMultipleBase
export interface IDocumentConditionalExclusive
  extends IDocumentConditionalExclusiveBase {
  header: IDocumentHeader
}
export interface IDocumentConditionalMultiple
  extends IDocumentConditionalMultipleBase {
  header: IDocumentHeader
}
export type DocumentConditional =
  | IDocumentConditionalExclusive
  | IDocumentConditionalMultiple
type Keys = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<
  Record<Keys, { [key: string]: string }>
>
// export type ConditionalStateType = "exclusive" | "multiple"

export interface IDocumentFields extends IDocumentText {
  fields: IFieldDisplay[]
}

export type DocumentSection =
  | IDocumentText
  | DocumentConditional
  | IDocumentFields
