import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genSheet from './genSheet'
export default async function genSheetGenerator(tree: Tree) {
  // TODO: Add Trailblazer support
  for (const src of allCharacterKeys.filter(
    (key) => !key.includes('Trailblazer')
  ))
    await genSheet(tree, { sheet_type: 'char', src })
  for (const src of allRelicSetKeys)
    await genSheet(tree, { sheet_type: 'relic', src })
  for (const src of allLightConeKeys)
    await genSheet(tree, { sheet_type: 'lightCone', src })
  await genIndex(tree, 'char')
  await genIndex(tree, 'relic')
  await genIndex(tree, 'lightCone')
}
