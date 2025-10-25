import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { commonSheets } from '../../data/util'
import genIndex from './genIndex'
import genMeta from './genMeta'
import genSheet from './genSheet'
export default async function genSheetGenerator(tree: Tree) {
  for (const sheet of allCharacterKeys) {
    await genSheet(tree, { sheet_type: 'char', sheet })
    await genMeta(tree, { sheet_type: 'char', sheet })
  }
  for (const sheet of allDiscSetKeys) {
    await genSheet(tree, { sheet_type: 'disc', sheet })
    await genMeta(tree, { sheet_type: 'disc', sheet })
  }
  for (const sheet of allWengineKeys) {
    await genSheet(tree, { sheet_type: 'wengine', sheet })
    await genMeta(tree, { sheet_type: 'wengine', sheet })
  }
  for (const sheet of commonSheets) {
    await genMeta(tree, { sheet_type: 'common', sheet })
  }
  await genIndex(tree, 'char')
  await genIndex(tree, 'disc')
  await genIndex(tree, 'wengine')
  await genIndex(tree, 'common')
}
