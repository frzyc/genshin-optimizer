import type {
  IConditionalData,
  IFormulaData,
} from '@genshin-optimizer/common/formula'
import type {
  CharacterKey,
  LightConeKey,
  RelicSetKey,
} from '@genshin-optimizer/sr/consts'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import type { GenDescExecutorSchema } from './schema'

// Note:
// It is important that `data` has NOT been loaded at this point
// as we are injecting `conditionals` to "collect" the metadata
import type { data as Data } from '../../data'
import type { Tag } from '../../data/util'
import { metaList } from '../../data/util'

type SheetKey = CharacterKey | RelicSetKey | LightConeKey
type Conditionals = Partial<Record<SheetKey, Record<string, IConditionalData>>>
type Formulas = Partial<Record<SheetKey, Record<string, IFormulaData<Tag>>>>

metaList.conditionals = []

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  // Defer loading of `data` to here so that the `metaList` trick above works
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { data } = require('../../data')
  const { outputPath } = options
  const formulas: Formulas = {}

  // Massage data from `metaList`
  const conditionals: Conditionals = {}
  for (const { tag, meta } of metaList.conditionals!) {
    const { sheet, q } = tag // Conditionals guarantee `sheet-q` pair uniqueness
    const sheetKey = sheet as SheetKey
    if (!conditionals[sheetKey]) conditionals[sheetKey] = {}
    if (!conditionals[sheetKey][q!])
      conditionals[sheetKey][q!] = {
        sheet,
        name: q,
        ...meta,
      } as IConditionalData
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
      // TODO: sheet can have 'enemy' 'custom', will they show up in meta?
      const sheet = tag.sheet! as SheetKey
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
// WARNING: Generated file, do not modify
export const conditionals = ${JSON.stringify(conditionals)} as cosnt
export const formulas = ${JSON.stringify(formulas)} as cosnt
  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(cwd, str)

  return { success: true }
}
