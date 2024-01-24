import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr-consts'
import { isIn } from '@genshin-optimizer/util'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genSheet from './genSheet'
import type { GenSheetGeneratorSchema } from './schema'
export default async function genSheetGenerator(
  tree: Tree,
  options: GenSheetGeneratorSchema
) {
  const { sheet_type, src } = options
  switch (sheet_type) {
    case 'char':
      if (!isIn(allCharacterKeys, src))
        return console.error(`Character with key ${src} does not exist.`)
      break
    case 'lightCone':
      if (!isIn(allLightConeKeys, src))
        return console.error(`Light Cone with key ${src} does not exist.`)
      break
    case 'relic':
      if (!isIn(allRelicSetKeys, src))
        return console.error(`Relic set with key ${src} does not exist.`)
      break
    default:
      console.error('Invalid sheet type')
      return
  }
  await genSheet(tree, options, true)
  await genIndex(tree, sheet_type)
  console.log('Generated sheet and index file.')
}
