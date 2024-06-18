import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genSheet from './genSheet'
export default async function genSheetGenerator(tree: Tree) {
  for (const sheet of allCharacterKeys)
    await genSheet(tree, { sheet_type: 'char', sheet })
  for (const sheet of allArtifactSetKeys)
    await genSheet(tree, { sheet_type: 'artifact', sheet })
  for (const sheet of allWeaponKeys)
    await genSheet(tree, { sheet_type: 'weapon', sheet })
  await genIndex(tree, 'char')
  await genIndex(tree, 'artifact')
  await genIndex(tree, 'weapon')
}
