import type { Read } from '@genshin-optimizer/game-opt/engine'
import {
  extractCondMetadata,
  extractFormulaMetadata,
  possibleValues,
} from '@genshin-optimizer/game-opt/formula'
import { read } from '@genshin-optimizer/pando/engine'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import { data } from '../../data'
import type { GenDescExecutorSchema } from './schema'

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath } = options

  const conditionals = extractCondMetadata(data, ({ sheet, q }) => ({
    sheet: sheet!,
    name: q!,
  }))
  const formulas = extractFormulaMetadata(data, (tag, value) => {
    if (
      // sheet-specific
      tag.sheet !== 'agg' &&
      tag.sheet !== 'relic' &&
      tag.sheet !== 'lightCone' &&
      // formula listing
      tag.qt === 'listing' &&
      tag.q === 'formulas' &&
      // pattern from `registerFormula`
      value.op === 'tag' &&
      'name' in value.tag &&
      'q' in value.tag
    ) {
      const sheet = tag.sheet!
      const name = value.tag['name']!
      const accus = new Set(possibleValues(value))
      accus.delete('')
      if (accus.size !== 1)
        throw new Error(
          `invalid conds values for ${sheet} ${name}: ${[...accus]}`
        )
      const accu = [...accus][0] as Read['accu']
      tag = { ...tag, ...value.tag }
      const r = read(tag, accu === 'unique' ? undefined : accu)
      return { sheet, name, accu, tag, read: r }
    }
    return undefined
  })
  const buffs = extractFormulaMetadata(data, (tag, value) => {
    if (
      // sheet-specific
      tag.sheet !== 'agg' &&
      tag.sheet !== 'relic' &&
      tag.sheet !== 'lightCone' &&
      // formula listing
      tag.qt === 'listing' &&
      tag.q === 'buffs' &&
      // pattern from `registerBuffs`
      value.op === 'tag' &&
      'name' in value.tag &&
      'q' in value.tag &&
      // Ignore double listings for damageType
      !(!value.tag['damageType1'] && value.tag['damageType2'] !== undefined)
    ) {
      const sheet = tag.sheet!
      const name = value.tag['name']!
      const accus = new Set(possibleValues(value))
      accus.delete('')
      if (accus.size !== 1)
        throw new Error(
          `invalid conds values for ${sheet} ${name}: ${[...accus]}`
        )
      const accu = [...accus][0] as Read['accu']
      tag = { ...tag, ...value.tag }
      const r = read(tag, accu === 'unique' ? undefined : accu)
      return { sheet, name, accu, tag, read: r }
    }
    return undefined
  })

  const cwd = path.join(workspaceRoot, outputPath)
  const prettierRc = await prettier.resolveConfig(cwd)
  const str = prettier.format(
    `
// WARNING: Generated file, do not modify
export const conditionals = ${JSON.stringify(conditionals)} as const
export const formulas = ${JSON.stringify(formulas)} as const
export const buffs = ${JSON.stringify(buffs)} as const
`,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(cwd, str)

  return { success: true }
}
