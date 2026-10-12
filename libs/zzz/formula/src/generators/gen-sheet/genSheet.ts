import { existsSync } from 'node:fs'
import * as path from 'node:path'
import type { Tree } from '@nx/devkit'
import { generateFiles } from '@nx/devkit'
import type { GenSheetGeneratorSchema } from './schema'

export default async function genSheet(
  tree: Tree,
  options: GenSheetGeneratorSchema,
  verbose = false
) {
  console.log(options)
  const { sheet_type } = options
  const file_location = `libs/zzz/formula/src/data/${sheet_type}/sheets`
  const dest = path.join(tree.root, file_location, `${options.sheet}.ts`)
  if (existsSync(dest)) {
    verbose &&
      console.warn(
        `Sheet at ${path.join(
          file_location,
          `${options.sheet}.ts`
        )} already exists.`
      )
    return
  }
  generateFiles(tree, path.join(__dirname, sheet_type), file_location, options)
}
