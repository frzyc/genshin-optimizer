import { isIn } from '@genshin-optimizer/common/util'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genMap from './genMap'
import type { GenMapGeneratorSchema } from './schema'
export default async function genMapGenerator(
  tree: Tree,
  options: GenMapGeneratorSchema
) {
  const { map_type, map } = options
  switch (map_type) {
    case 'char':
      if (!isIn(allCharacterKeys, map))
        return console.error(`Character with key ${map} does not exist.`)
      break
    case 'wengine':
      if (!isIn(allWengineKeys, map))
        return console.error(`Wengine with key ${map} does not exist.`)
      break
    case 'disc':
      if (!isIn(allDiscSetKeys, map))
        return console.error(`Disc set with key ${map} does not exist.`)
      break
    default:
      console.error('Invalid map type')
      return
  }
  await genMap(tree, options, true)
  await genIndex(tree, map_type)
  console.log('Generated map and index file.')
}
