import { writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  extractCondMetadata,
  extractFormulaMetadata,
} from '@genshin-optimizer/game-opt/formula'
import { workspaceRoot } from '@nx/devkit'
import { data } from '../../data'
import type { Tag } from '../../data/util'
import type { GenDescExecutorSchema } from './schema'

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath } = options

  const conditionals = extractCondMetadata(data, ({ sheet, q }) => ({
    sheet: sheet!,
    name: q!,
  }))
  const formulas = extractFormulaMetadata(data, (tag: Tag, value) => {
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
      const name = value.tag.name!
      return { sheet, name, tag: { ...tag, ...value.tag } }
    }
    return undefined
  })
  const buffs = extractFormulaMetadata(data, (tag: Tag, value) => {
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
      !(!value.tag.damageType1 && value.tag.damageType2 !== undefined)
    ) {
      const sheet = tag.sheet!
      const name = value.tag.name!
      return { sheet, name, tag: { ...tag, ...value.tag } }
    }
    return undefined
  })

  const cwd = path.join(workspaceRoot, outputPath)
  const str = `
// WARNING: Generated file, do not modify
export const conditionals = ${JSON.stringify(conditionals)} as const
export const formulas = ${JSON.stringify(formulas)} as const
export const buffs = ${JSON.stringify(buffs)} as const
`
  const formatted = await formatText('index.ts', str)
  writeFileSync(cwd, formatted)

  return { success: true }
}
