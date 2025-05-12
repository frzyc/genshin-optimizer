import { allCharacterKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { type Tree } from '@nx/devkit'
import genIndex from './genIndex'
import genMap from './genMap'
export default async function genMapGenerator(tree: Tree) {
  for (const map of allCharacterKeys)
    await genMap(tree, { map_type: 'char', map })
  // for (const map of allDiscSetKeys)
  //   await genMap(tree, { map_type: 'disc', map })
  for (const map of allWengineKeys)
    await genMap(tree, { map_type: 'wengine', map })
  await genIndex(tree, 'char')
  // await genIndex(tree, 'disc')
  await genIndex(tree, 'wengine')
}
