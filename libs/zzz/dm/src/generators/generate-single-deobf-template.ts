import { existsSync, writeFileSync } from 'fs'
import * as path from 'path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import type { Tree } from '@nx/devkit'
import type { GenericDmFile } from '../dm/deobf/types'
import { readDMJSON } from '../util'
import type { GenerateSingleDeobfTemplateGeneratorSchema } from './schema'

export async function generateSingleDeobfTemplateGenerator(
  tree: Tree,
  { file }: GenerateSingleDeobfTemplateGeneratorSchema,
  verbose = false
) {
  const file_location = `libs/zzz/dm/src/dm/deobf/FileCfg`
  const dest = path.join(tree.root, file_location, `${file}.ts`)
  const lowerFile = `${file[0].toLowerCase()}${file.slice(1)}`
  const dmFile = JSON.parse(
    readDMJSON(`FileCfg/${file}.json`, tree.root)
  ) as GenericDmFile
  const objToUse = getObjToUse(file)
  const dmObj = Object.values(dmFile)[0][objToUse]
  const reverseMapping: Record<string | number, string> = {}
  const keyValueSet: Record<string, Set<string | number>> = {}

  Object.entries(dmObj).forEach(([k, v]) => {
    const stringified = JSON.stringify(v)
    keyValueSet[k] = new Set<string | number>()
    Object.values(dmFile)[0].forEach((o) =>
      keyValueSet[k].add(JSON.stringify(o[k]))
    )
    if (reverseMapping[stringified]) {
      console.log(
        `Duplicate reverse mapping key for property ${k} with value ${stringified} in ${file}`
      )
      if (
        Object.values(dmFile)[0].every(
          (obj) => JSON.stringify(obj[k]) === stringified
        )
      ) {
        console.log(
          `Note: Property ${k} is the same value ${stringified} across all objects`
        )
        reverseMapping[stringified] += `-${k}Identical`
      } else {
        reverseMapping[stringified] += `-${k}`
      }
    } else {
      reverseMapping[stringified] = `todo-${k}`
    }
  })

  // Debug log to help with identifying if a parameter is actually important or just duplicated nonsense
  console.log(`PropValue mappings for ${file}`)
  console.log(keyValueSet)
  if (existsSync(dest)) {
    verbose && console.warn(`Template at ${dest} already exists.`)
    return
  }

  const contents = `
import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = ${JSON.stringify(reverseMapping)}

const ${lowerFile} = JSON.parse(
  readDMJSON('FileCfg/${file}.json')
) as GenericDmFile

const dmObj = Object.values(${lowerFile})[0][${objToUse}]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
  `
  const formatted = await formatText(dest, contents)
  writeFileSync(dest, formatted)
}

function getObjToUse(file: string) {
  if (file === 'ItemTemplateTb') return 4
  else return 0
}

export default generateSingleDeobfTemplateGenerator
