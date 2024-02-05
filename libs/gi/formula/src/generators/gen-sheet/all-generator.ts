import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genSheet from './genSheet'
export default async function genSheetGenerator(tree: Tree) {
  for (const src of allCharacterKeys)
    await genSheet(tree, { sheet_type: 'char', src })
  for (const src of allArtifactSetKeys)
    await genSheet(tree, { sheet_type: 'artifact', src })
  for (const src of allWeaponKeys)
    await genSheet(tree, { sheet_type: 'weapon', src })
  await genIndex(tree, 'char')
  await genIndex(tree, 'artifact')
  await genIndex(tree, 'weapon')
}
