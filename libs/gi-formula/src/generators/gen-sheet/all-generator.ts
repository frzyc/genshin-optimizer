import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/consts'
import type { Tree } from '@nx/devkit'
import genSheet from './genSheet'
export default async function genSheetGenerator(tree: Tree) {
  for (const src of allCharacterKeys)
    await genSheet(tree, { sheet_type: 'char', src })
  for (const src of allArtifactSetKeys)
    await genSheet(tree, { sheet_type: 'artifact', src })
  for (const src of allWeaponKeys)
    await genSheet(tree, { sheet_type: 'weapon', src })
}
