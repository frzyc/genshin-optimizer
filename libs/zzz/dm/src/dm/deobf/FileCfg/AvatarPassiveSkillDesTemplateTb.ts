import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '1': 'todo-FPHPEALJHCH',
  '1011': 'AvatarId',
  '1011501': 'AvatarSkillLevelTemplateId',
  '[]': 'Potentials',
  '["Anbi_UniqueSkill_01_Desc","Anbi_MathSkill_Desc"]': 'DescArray',
  '["Anbi_UniqueSkill_Title","Anbi_MathSkill_Title"]': 'TitleArray',
}

const avatarPassiveSkillDesTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarPassiveSkillDesTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarPassiveSkillDesTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
