import { formatFiles, generateFiles } from '@nx/devkit'
import type { Tree } from '@nx/devkit'
import * as path from 'path'
import type { GenSheetGeneratorSchema } from './schema'

export async function genSheetGenerator(
  tree: Tree,
  options: GenSheetGeneratorSchema
) {
  const { sheet_type } = options
  if (!['artifact', 'char', 'weapon'].includes(sheet_type)) {
    console.log('Invalid sheet type')
    return
  }
  const file_location = `libs/gi-formula/src/data/${sheet_type}`
  generateFiles(tree, path.join(__dirname, sheet_type), file_location, options)
  console.log(
    'Generated sheet. Include the generated file in the corresponding `index.ts` to complete the process'
  )
  await formatFiles(tree)
}

export default genSheetGenerator
