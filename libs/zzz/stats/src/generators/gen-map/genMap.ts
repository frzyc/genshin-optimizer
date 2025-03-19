import { existsSync } from 'node:fs'
import * as path from 'node:path'
import type { Tree } from '@nx/devkit'
import { generateFiles } from '@nx/devkit'
import type { GenMapGeneratorSchema } from './schema'

export default async function genMap(
  tree: Tree,
  options: GenMapGeneratorSchema,
  verbose = false
) {
  console.log(options)
  const { map_type } = options
  const file_location = `libs/zzz/stats/src/mappedStats/${map_type}/maps`
  const dest = path.join(tree.root, file_location, `${options.map}.ts`)
  if (existsSync(dest)) {
    verbose &&
      console.warn(
        `Map at ${path.join(
          file_location,
          `${options.map}.ts`
        )} already exists.`
      )
    return
  }
  generateFiles(tree, path.join(__dirname, map_type), file_location, options)
}
