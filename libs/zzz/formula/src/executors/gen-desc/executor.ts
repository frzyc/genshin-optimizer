import * as path from 'path'
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
import { writeFile } from 'fs/promises'
import { data } from '../../data'
import { type Tag, commonSheets } from '../../data/util'
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
      const name = value.tag['name']!
      return { sheet, name, tag: { ...tag, ...value.tag } }
    }
    return undefined
  })
  const buffs = extractFormulaMetadata<Tag, Tag>(
    data,
    (tag: Tag, value, result) => {
      if (
        // sheet-specific
        tag.sheet !== 'agg' &&
        tag.sheet !== 'disc' &&
        tag.sheet !== 'wengine' &&
        // formula listing
        tag.qt == 'listing' &&
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
