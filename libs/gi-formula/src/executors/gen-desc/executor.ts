import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as path from 'path'
import type { GenDescExecutorSchema } from './schema'

// Note:
// It is important that `data` has NOT been loaded at this point
// as we are injecting `conditionals` to "collect" the metadata
import * as prettier from 'prettier'
import type { entries as Entries } from '../../data'
import { metaList } from '../../data/util'
metaList.conditionals = {}

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  // Defer loading of `data` to here so that the `metaList` trick above works
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { entries } = require('../../data')
  const { outputPath } = options
  const { conditionals } = metaList
  const formulas: Record<string, Record<string, any>> = {}

  // Massage data from `metaList`
  for (const [src, entries] of Object.entries(conditionals!)) {
    for (const [name, obj] of Object.entries(entries!)) {
      entries![name] = { src, name, tag: { src, name }, ...obj }
    }
  }

  // Crawl for formulas in sheet-specific formula listing
  for (const { tag, value } of entries as typeof Entries) {
    if (
      // sheet-specific
      tag['src'] != 'agg' &&
      // formula listing
      tag['qt'] == 'formula' &&
      tag['q'] == 'listing' &&
      // pattern from `registerFormula`
      value['op'] == 'tag' &&
      'name' in value.tag &&
      'q' in value.tag
    ) {
      const src = tag.src!
      const name = value.tag['name']!
      if (!formulas[src]) formulas[src] = {}
      if (formulas[src][name])
        console.error(`Duplicated formula definition for ${src}:${name}`)
      formulas[src][name] = { src, name, tag: { ...tag, ...value.tag } }
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
  src: string // entity
  name: string // formula name
  tag: Tag // tag used to access value
}

/// Conditional whose values are True (1.0) and False (0.0)
export type IBoolConditionalData = {
  type: 'bool' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value
}
/// Conditional whose values are those in the list. When inputting the
/// entry, use the (0-based) position in the list
export type IListConditionalData = {
  type: 'list' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value

  list: [string] // feasible values
}
/// Conditional whose values are regular numbers
export type INumConditionalData = {
  type: 'num' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value

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
