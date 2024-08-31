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
/// Conditional whose values are True (1.0) and False (0.0)
export type IBoolConditionalData = {
  type: 'bool' // type discriminator
  sheet: string // entity
  name: string // conditional name
}
/// Conditional whose values are those in the list. When inputting the
/// entry, use the (0-based) position in the list
export type IListConditionalData = {
  type: 'list' // type discriminator
  sheet: string // entity
  name: string // conditional name

  list: string[] // feasible values
}
/// Conditional whose values are regular numbers
export type INumConditionalData = {
  type: 'num' // type discriminator
  sheet: string // entity
  name: string // conditional name

  int_only: boolean // whether the value must be an integer
  min?: number // smallest feasible value, if applicable
  max?: number // largest feasible value, if applicable
}
