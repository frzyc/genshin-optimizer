import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genMap from './genMap'
export default async function genMapGenerator(tree: Tree) {
  for (const map of allCharacterKeys)
    await genMap(tree, { map_type: 'char', map })
  for (const map of allRelicSetKeys)
    await genMap(tree, { map_type: 'relic', map })
  for (const map of allLightConeKeys)
    await genMap(tree, { map_type: 'lightCone', map })
  await genIndex(tree, 'char')
  await genIndex(tree, 'relic')
  await genIndex(tree, 'lightCone')
}
