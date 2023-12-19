import { formatFiles, generateFiles } from '@nx/devkit'
import type { Tree } from '@nx/devkit'
import * as path from 'path'
import type { GenSheetGeneratorSchema } from './schema'
import { existsSync } from 'fs'

export default async function genSheet(
  tree: Tree,
  options: GenSheetGeneratorSchema,
  verbose = false
) {
  const { sheet_type } = options
  const file_location = `libs/gi-formula/src/data/${sheet_type}`
  const dest = path.join(tree.root, file_location, `${options.src}.ts`)
  if (existsSync(dest)) {
    verbose &&
      console.warn(
        `Sheet at ${path.join(
          file_location,
          `${options.src}.ts`
        )} already exists.`
      )
    return
  }
  generateFiles(tree, path.join(__dirname, sheet_type), file_location, options)
  await formatFiles(tree)
}
