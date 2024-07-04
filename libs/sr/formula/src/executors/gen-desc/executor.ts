import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as path from 'path'
import type { GenDescExecutorSchema } from './schema'

// Note:
// It is important that `data` has NOT been loaded at this point
// as we are injecting `conditionals` to "collect" the metadata
import * as prettier from 'prettier'
import type { data as Data } from '../../data'
import { metaList } from '../../data/util'
metaList.conditionals = []

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  // Defer loading of `data` to here so that the `metaList` trick above works
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { data } = require('../../data')
  const { outputPath } = options
  const formulas: Record<string, Record<string, any>> = {}

  // Massage data from `metaList`
  const conditionals: Record<string, Record<string, any>> = {}
  for (const { tag, meta } of metaList.conditionals!) {
    const { sheet, q } = tag // Conditionals guarantee `sheet-q` pair uniqueness
    if (!conditionals[sheet!]) conditionals[sheet!] = {}
    if (!conditionals[sheet!][q!])
      conditionals[sheet!][q!] = { sheet, name: q, ...meta }
    else console.log(`Duplicated conditionals for ${sheet}:${q}`)
  }

  // Crawl for formulas in sheet-specific formula listing
  for (const { tag, value } of data as typeof Data) {
    if (
      // sheet-specific
      tag['sheet'] != 'agg' &&
      // formula listing
      tag['qt'] == 'listing' &&
      tag['q'] == 'formulas' &&
      // pattern from `registerFormula`
      value['op'] == 'tag' &&
      'name' in value.tag &&
      'q' in value.tag
    ) {
      const sheet = tag.sheet!
      const name = value.tag['name']!
      if (!formulas[sheet]) formulas[sheet] = {}
      if (formulas[sheet][name])
        console.error(`Duplicated formula definition for ${sheet}:${name}`)
      formulas[sheet][name] = {
        sheet,
        name,
        tag: { ...tag, ...value.tag },
      }
    }
  }

  const cwd = path.join(workspaceRoot, outputPath)
  const prettierRc = await prettier.resolveConfig(cwd)
  const str = prettier.format(
    `
type Tag = Record<string, string>

export type IConditionalData =
  | IBoolConditionalData
  | IListConditionalData
  | INumConditionalData
export type IFormulaData = {
  sheet: string // entity
  name: string // formula name
  tag: Tag // tag used to access value
}

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

  list: [string] // feasible values
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

export const conditionals = ${JSON.stringify(conditionals)}
export const formulas = ${JSON.stringify(formulas)}
  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(cwd, str)

  return { success: true }
}
