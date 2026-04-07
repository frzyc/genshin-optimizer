import { writeFileSync } from 'fs'
import * as path from 'path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import type { Tree } from '@nx/devkit'
import { allFileCfgs } from '../consts'

export default async function generateIndex(tree: Tree) {
  const file_location = `libs/zzz/dm/src/dm/deobf/FileCfg`
  const dest = path.join(tree.root, file_location, `index.ts`)
  const contents = `// WARNING: Generated file, do not modify
${allFileCfgs.map((cfg) => `import ${cfg} from './${cfg}'`).join('\n')}

export const deobfMappings = {
  ${allFileCfgs.join('\n,  ')}
}
`
  const formatted = await formatText(dest, contents)
  writeFileSync(dest, formatted)
}
