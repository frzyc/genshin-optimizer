import { isIn } from '@genshin-optimizer/common/util'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genSheet from './genSheet'
import type { GenSheetGeneratorSchema } from './schema'
export default async function genSheetGenerator(
  tree: Tree,
  options: GenSheetGeneratorSchema
) {
  const { sheet_type, sheet } = options
  switch (sheet_type) {
    case 'char':
      if (!isIn(allCharacterKeys, sheet))
        return console.error(`Character with key ${sheet} does not exist.`)
      break
    case 'wengine':
      if (!isIn(allWengineKeys, sheet))
        return console.error(`Wengine with key ${sheet} does not exist.`)
      break
    case 'disc':
      if (!isIn(allDiscSetKeys, sheet))
        return console.error(`Disc set with key ${sheet} does not exist.`)
      break
    default:
      console.error('Invalid sheet type')
      return
  }
  await genSheet(tree, options, true)
  await genIndex(tree, sheet_type)
  console.log('Generated sheet and index file.')
}
