import { existsSync } from 'fs'
import * as path from 'path'
import type { Tree } from '@nx/devkit'
import { generateFiles } from '@nx/devkit'
import type { GenSheetGeneratorSchema } from './schema'

export default async function genMeta(
  tree: Tree,
  options: GenSheetGeneratorSchema,
  verbose = false
) {
  console.log(options)
  const { sheet_type } = options
  const file_location = `libs/zzz/formula/src/meta`
  const types = ['formulas', 'conditionals', 'buffs']
  for (const type of types) {
    const dest = path.join(
      tree.root,
      file_location,
      sheet_type,
      options.sheet,
      `${type}.ts`
    )
    if (existsSync(dest)) {
      verbose &&
        console.warn(
          `Meta at ${path.join(
            file_location,
            sheet_type,
            options.sheet,
            `${type}.ts`
          )} already exists.`
        )
      return
    }
  }

  generateFiles(tree, path.join(__dirname, 'meta'), file_location, options)
}
