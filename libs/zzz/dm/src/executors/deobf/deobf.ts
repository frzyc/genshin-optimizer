import { writeFileSync } from 'fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import { objKeyValMap } from '@genshin-optimizer/common/util'
import { type PromiseExecutor, workspaceRoot } from '@nx/devkit'
import type { GenericDmFile } from '../../dm/deobf'
import { deobfMappings } from '../../dm/deobf'
import { readDMJSON } from '../../util'
import type { DeobfExecutorSchema } from './schema'

const runExecutor: PromiseExecutor<DeobfExecutorSchema> = async (options) => {
  console.log('Executor ran for Deobf', options)
  for (const [file, deobfObj] of Object.entries(deobfMappings)) {
    const outputFile = `${workspaceRoot}/libs/zzz/dm/ZenlessDataDeobf/FileCfg/${file}.json`
    const dm = JSON.parse(readDMJSON(`FileCfg/${file}.json`)) as GenericDmFile
    const deobfedDm = Object.values(dm)[0].map((dmObj) =>
      objKeyValMap(
        Object.entries(dmObj),
        ([key, value]) => [deobfObj.mapping[key], value] as const
      )
    )
    const formatted = await formatText(outputFile, JSON.stringify(deobfedDm))
    writeFileSync(outputFile, formatted)
  }
  return {
    success: true,
  }
}

export default runExecutor
