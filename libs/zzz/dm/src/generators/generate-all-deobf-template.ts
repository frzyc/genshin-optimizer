import type { Tree } from '@nx/devkit'

import { allFileCfgs } from '../consts'
import generateIndex from './generate-index-deobf'
import generateSingleDeobfTemplateGenerator from './generate-single-deobf-template'

export async function generateAllDeobfTemplateGenerator(tree: Tree) {
  for (const dmFile of allFileCfgs) {
    await generateSingleDeobfTemplateGenerator(tree, { file: dmFile })
  }
  await generateIndex(tree)
}

export default generateAllDeobfTemplateGenerator
