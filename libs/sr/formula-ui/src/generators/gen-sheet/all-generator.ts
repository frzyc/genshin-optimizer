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
  for (const sheet of allCharacterKeys.filter(
    (key) => !key.includes('Trailblazer')
  ))
    await genSheet(tree, { sheet_type: 'char', sheet })
  for (const sheet of allRelicSetKeys)
    await genSheet(tree, { sheet_type: 'relic', sheet })
  for (const sheet of allLightConeKeys)
    await genSheet(tree, { sheet_type: 'lightCone', sheet })
  await genIndex(tree, 'char')
  await genIndex(tree, 'relic')
  await genIndex(tree, 'lightCone')
}
