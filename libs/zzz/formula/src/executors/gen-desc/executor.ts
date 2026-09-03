import { writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  extractCondMetadata,
  extractFormulaMetadata,
} from '@genshin-optimizer/game-opt/formula'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import { workspaceRoot } from '@nx/devkit'
import { data } from '../../data'
import { commonSheets, type Tag } from '../../data/util'
import type { CatalogListing } from '../../formulaCatalogBuild'
import { buildFormulaCatalog } from '../../formulaCatalogBuild'
import {
  normalizeSheetFormulaKeys,
  provisionalFormulaMetaKey,
} from '../../formulaMeta'
import { STAT_SHEET } from '../../formulaRef'
import { stripCalcContextTag } from '../../hit'
import type { GenDescExecutorSchema } from './schema'

export default async function runExecutor(
  options: GenDescExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath } = options

  const conditionals = extractCondMetadata(data, ({ sheet, q }) => ({
    sheet: sheet!,
    name: q!,
  }))
  const rawFormulas = extractFormulaMetadata<Tag, Tag>(
    data,
    (tag: Tag, value, _result) => {
      if (
        // sheet-specific
        tag.sheet !== 'agg' &&
        tag.sheet !== 'disc' &&
        tag.sheet !== 'wengine' &&
        // formula listing
        tag.qt === 'listing' &&
        tag.q === 'formulas' &&
        // pattern from `registerFormula`
        value.op === 'tag' &&
        'name' in value.tag &&
        'q' in value.tag
      ) {
        const sheet = tag.sheet!
        const abilityName = value.tag['name']!
        const q = value.tag['q']!
        const metaKey = provisionalFormulaMetaKey(abilityName, q)
        return {
          sheet,
          name: metaKey,
          tag: { ...tag, ...value.tag, name: abilityName },
        }
      }
      return undefined
    }
  )
  const formulas = Object.fromEntries(
    Object.entries(rawFormulas).map(([sheet, sheetFormulas]) => [
      sheet,
      normalizeSheetFormulaKeys(sheetFormulas),
    ])
  )
  const buffs = extractFormulaMetadata<Tag, Tag>(
    data,
    (tag: Tag, value, result) => {
      if (
        // sheet-specific
        tag.sheet !== 'agg' &&
        tag.sheet !== 'disc' &&
        tag.sheet !== 'wengine' &&
        // formula listing
        tag.qt === 'listing' &&
        tag.q === 'buffs' &&
        // pattern from `registerBuffs`
        value.op === 'tag' &&
        'name' in value.tag &&
        'q' in value.tag &&
        // Ignore addOnce non-stacking mechanics
        value.tag['qt'] !== 'stackIn'
      ) {
        const sheet = tag.sheet!
        const name = value.tag['name']!
        const preExisting = result[sheet]?.[name]
        // Ignore double listings for damageType
        if (
          preExisting &&
          preExisting.tag.damageType1 !== undefined &&
          preExisting.tag.damageType1 === value.tag['damageType2'] &&
          preExisting.tag.damageType2 === value.tag['damageType1']
        ) {
          return undefined
        }
        return { sheet, name, tag: { ...tag, ...value.tag } }
      }
      return undefined
    }
  )

  const catalogListings: CatalogListing[] = []
  for (const { tag, value } of data) {
    if (
      tag.sheet === 'agg' ||
      tag.sheet === 'disc' ||
      tag.sheet === 'wengine' ||
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
      name: inner.q,
      dim: inner.qt,
      tag: stripCalcContextTag(inner),
    })
  }
  const formulaCatalog = buildFormulaCatalog(catalogListings)

  const mapMeta = async (type: string, key: string) => {
    await dumpMeta(
      path.join(outputPath, type, key),
      'formulas',
      formulas[key] ?? {}
    )
    await dumpMeta(path.join(outputPath, type, key), 'buffs', buffs[key] ?? {})
    await dumpMeta(
      path.join(outputPath, type, key),
      'conditionals',
      conditionals[key] ?? {}
    )
  }

  await Promise.all([
    ...allCharacterKeys.map(async (ck) => {
      await mapMeta('char', ck)
    }),
    ...allWengineKeys.map(async (wk) => {
      await mapMeta('wengine', wk)
    }),
    ...allDiscSetKeys.map(async (dk) => {
      await mapMeta('disc', dk)
    }),
    ...commonSheets.map(async (key) => {
      await mapMeta('common', key)
    }),
  ])

  const catalogPath = path.join(workspaceRoot, outputPath, 'formulaCatalog.ts')
  const catalogSrc = `
// WARNING: Generated file, do not modify
import type { FormulaCatalog } from '../formulaRef'

export const formulaCatalog = ${JSON.stringify(formulaCatalog)} as FormulaCatalog
`
  await writeFile(catalogPath, await formatText('index.ts', catalogSrc))

  return { success: true }
}

async function dumpMeta(
  outputPath: string,
  metaType: 'conditionals' | 'formulas' | 'buffs',
  data: any
) {
  const cwd = path.join(workspaceRoot, outputPath)
  const str = `
// WARNING: Generated file, do not modify
export const ${metaType} = ${JSON.stringify(data)} as const
`
  const formatted = await formatText('index.ts', str)
  await writeFile(path.join(cwd, `${metaType}.ts`), formatted)
}
