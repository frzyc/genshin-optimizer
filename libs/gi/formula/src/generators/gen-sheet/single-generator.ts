import { isIn } from '@genshin-optimizer/common/util'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
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
    case 'weapon':
      if (!isIn(allWeaponKeys, src))
        return console.error(`Weapon with key ${src} does not exist.`)
      break
    case 'artifact':
      if (!isIn(allArtifactSetKeys, src))
        return console.error(`Artifact set with key ${src} does not exist.`)
      break
    default:
      console.error('Invalid sheet type')
      return
  }
  await genSheet(tree, options, true)
  await genIndex(tree, sheet_type)
  console.log(
    'Generated sheet. Include the generated file in the corresponding `index.ts` to complete the process'
  )
}
