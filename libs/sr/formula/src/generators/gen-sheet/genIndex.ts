import { writeFileSync } from 'fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/sr/formula/src/data/${sheet_type}/index.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      break
    case 'relic':
      await writeRelicIndex(file_location)
      break
    case 'lightCone':
      await writeLightConeIndex(file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const index = `
import type { TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './sheets/${charKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allCharacterKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeRelicIndex(path: string) {
  const index = `
import type { TagMapNodeEntries } from '../util'
${allRelicSetKeys
  .map((setKey) => `import ${setKey} from './sheets/${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allRelicSetKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeLightConeIndex(path: string) {
  const index = `
import type { TagMapNodeEntries } from '../util'
${allLightConeKeys
  .map(
    (lightConeKey) => `import ${lightConeKey} from './sheets/${lightConeKey}'`
  )
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allLightConeKeys.join(',\n  ')}
]

export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}
