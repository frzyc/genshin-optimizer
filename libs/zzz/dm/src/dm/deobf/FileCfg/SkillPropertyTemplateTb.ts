import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '3': 'todo-GJBIMEAALIF', // ALways 3
  '1001': 'SkillPropertyId',
  '10000': 'todo-FAJFIBHEPIM', // Always 10000
  '"SkillDamageRate"': 'SkillPropertyType',
  '"{0:0.#%}"': 'Format',
}

const skillPropertyTemplateTb = JSON.parse(
  readDMJSON('FileCfg/SkillPropertyTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(skillPropertyTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
