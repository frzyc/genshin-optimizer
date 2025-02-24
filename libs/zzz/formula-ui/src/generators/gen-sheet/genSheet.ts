import type { Tree } from '@nx/devkit'
import { generateFiles } from '@nx/devkit'
import { existsSync } from 'fs'
import * as path from 'path'
import type { GenSheetGeneratorSchema } from './schema'

export default async function genSheet(
  tree: Tree,
  options: GenSheetGeneratorSchema,
  verbose = false
) {
  console.log(options)
  const { sheet_type } = options
  const file_location = `libs/zzz/formula-ui/src/${sheet_type}/sheets`
  const dest = path.join(tree.root, file_location, `${options.sheet}.tsx`)
  if (existsSync(dest)) {
    verbose &&
      console.warn(
        `Sheet at ${path.join(
          file_location,
          `${options.sheet}.tsx`
        )} already exists.`
      )
    return
  }
  generateFiles(tree, path.join(__dirname, sheet_type), file_location, options)
}
