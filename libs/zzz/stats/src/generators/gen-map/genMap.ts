import { existsSync, writeFileSync } from 'fs'
import * as path from 'path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import { objMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { generateFiles } from '@nx/devkit'
import { allStats } from '../../allStats'
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
  if (options.map_type === 'char') {
    await generateCharMap(file_location, options.map as CharacterKey)
  } else {
    generateFiles(tree, path.join(__dirname, map_type), file_location, options)
  }
}

// Generate char maps differently so we can have a definitely typed object
async function generateCharMap(file_location: string, charKey: CharacterKey) {
  const file = `
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = '${charKey}'
const data_gen = getCharStat(key)

const dm =
  ${JSON.stringify(
    objMap(allStats.char[charKey].skillParams, (param, skillKey) =>
      objMap(
        param,
        (_skillParams, key) => `data_gen.skillParams['${skillKey}']['${key}']`
      )
    )
  )
    // Remove the double quotes inserted by stringify
    .replace(
      /"(data_gen.skillParams\[.*?\]\[.*?\])"/g,
      (_match, contents) => contents
    )} as const

export default dm

  `

  const dest = path.join(file_location, `${charKey}.ts`)
  const formatted = await formatText(dest, file)
  writeFileSync(dest, formatted)
}
