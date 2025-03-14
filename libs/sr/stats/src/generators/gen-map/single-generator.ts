import { isIn } from '@genshin-optimizer/common/util'
import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genMap from './genMap'
import type { GenMapGeneratorSchema } from './schema'
export default async function genMapGenerator(
  tree: Tree,
  options: GenMapGeneratorSchema,
) {
  const { map_type, map } = options
  switch (map_type) {
    case 'char':
      if (!isIn(allCharacterKeys, map))
        return console.error(`Character with key ${map} does not exist.`)
      break
    case 'lightCone':
      if (!isIn(allLightConeKeys, map))
        return console.error(`Light Cone with key ${map} does not exist.`)
      break
    case 'relic':
      if (!isIn(allRelicSetKeys, map))
        return console.error(`Relic set with key ${map} does not exist.`)
      break
    default:
      console.error('Invalid map type')
      return
  }
  await genMap(tree, options, true)
  await genIndex(tree, map_type)
  console.log('Generated map and index file.')
}
