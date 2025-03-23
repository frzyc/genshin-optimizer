import { writeFileSync } from 'fs'
import * as path from 'path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  extractCondMetadata,
  extractFormulaMetadata,
} from '@genshin-optimizer/game-opt/formula'
import { workspaceRoot } from '@nx/devkit'
import { entries } from '../../data'
import type { Tag } from '../../data/util'
import type { GenDescExecutorSchema } from './schema'

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath } = options

  const conditionals = extractCondMetadata(entries, ({ sheet, q }) => ({
    sheet: sheet!,
    name: q!,
  }))
  const formulas = extractFormulaMetadata(entries, (tag: Tag, value) => {
    if (
      // sheet-specific
      tag.sheet != 'agg' &&
      tag.sheet !== 'art' &&
      // formula listing
      tag.qt == 'listing' &&
      tag.q == 'formulas' &&
      // pattern from `registerFormula`
      value.op == 'tag' &&
      'name' in value.tag &&
      'q' in value.tag
    ) {
      const sheet = tag.sheet!
      const name = value.tag['name']!
      return { sheet, name, tag: { ...tag, ...value.tag } }
    }
    return undefined
  })

  const cwd = path.join(workspaceRoot, outputPath)
  const str = `
// WARNING: Generated file, do not modify
export const conditionals = ${JSON.stringify(conditionals)} as const
export const formulas = ${JSON.stringify(formulas)} as const
`
  const formatted = await formatText('index.ts', str)
  writeFileSync(cwd, formatted)

  return { success: true }
}
