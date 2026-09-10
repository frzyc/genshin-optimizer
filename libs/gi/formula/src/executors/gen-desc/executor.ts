import { writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  extractCondMetadata,
  extractFormulaMetadata,
} from '@genshin-optimizer/game-opt/formula'
import { workspaceRoot } from '@nx/devkit'
import { entries } from '../../data'
import type { Tag } from '../../data/util'
import {
  buildFormulaCatalog,
  type CatalogListing,
} from '../../formulaCatalogBuild'
import { STAT_SHEET, stripCalcContextTag } from '../../formulaRef'
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
      tag.sheet !== 'agg' &&
      tag.sheet !== 'art' &&
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
      return { sheet, name, tag: { ...tag, ...value.tag } }
    }
    return undefined
  })

  const catalogListings: CatalogListing[] = []
  for (const { tag, value } of entries) {
    if (
      tag.sheet === 'agg' ||
      tag.sheet === 'art' ||
      tag.qt !== 'listing' ||
      tag.q !== 'formulas' ||
      value.op !== 'tag' ||
      !('q' in value.tag)
    )
      continue

    const inner = value.tag as Tag
    if (inner.name) {
      catalogListings.push({
        catalogSheet: tag.sheet!,
        name: inner.name,
        dim: inner.q!,
        tag: { ...tag, ...inner, name: inner.name },
      })
      continue
    }
    if (!inner.q || !inner.qt) continue
    catalogListings.push({
      catalogSheet: STAT_SHEET,
      name: inner['ele'] ? `${inner['ele']}_${inner.q}` : inner.q,
      dim: inner.qt,
      tag: stripCalcContextTag(inner),
    })
  }
  const formulaCatalog = buildFormulaCatalog(catalogListings)

  const cwd = path.join(workspaceRoot, outputPath)
  const str = `
// WARNING: Generated file, do not modify
export const conditionals = ${JSON.stringify(conditionals)} as const
export const formulas = ${JSON.stringify(formulas)} as const
`
  const formatted = await formatText('index.ts', str)
  writeFileSync(cwd, formatted)

  const catalogPath = path.join(path.dirname(cwd), 'formulaCatalog.ts')
  const catalogSrc = `
// WARNING: Generated file, do not modify
import type { FormulaCatalog } from './formulaRef'

export const formulaCatalog = ${JSON.stringify(formulaCatalog)} as FormulaCatalog
`
  writeFileSync(catalogPath, await formatText('index.ts', catalogSrc))

  return { success: true }
}
