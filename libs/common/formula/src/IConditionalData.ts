type Tag = Record<string, string>

export type IFormulaData<T = Tag> = {
  sheet: string // entity
  name: string // formula name
  tag: T // tag used to access value
}

export type IConditionalData =
  | IBoolConditionalData
  | IListConditionalData
  | INumConditionalData

export interface IConditionalIdentifier {
  sheet: string // entity
  name: string // conditional name
}
/// Conditional whose values are True (1.0) and False (0.0)
export interface IBoolConditionalData extends IConditionalIdentifier {
  type: 'bool' // type discriminator
}
/// Conditional whose values are those in the list. When inputting the
/// entry, use the (0-based) position in the list
export interface IListConditionalData extends IConditionalIdentifier {
  type: 'list' // type discriminator

  list: readonly string[] // feasible values
}
/// Conditional whose values are regular numbers
export interface INumConditionalData extends IConditionalIdentifier {
  type: 'num' // type discriminator

  int_only: boolean // whether the value must be an integer
  min?: number | undefined // smallest feasible value, if applicable
  max?: number | undefined // largest feasible value, if applicable
}
