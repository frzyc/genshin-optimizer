import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '0': 'todo-KFDFEMBDLKA-GHCEAHCKJHO-LKFOANPAFEO-ICEDFCOBJNA', // GHCEAHCKJHO is skill type
  '1011': 'AvatarId',
  '101100001': 'SkillDesId',
  '"Anbi_Skill_Normal_Title"': 'Title',
  '"Anbi_Skill_Normal_Desc"': 'Desc',
  '""': 'Parameters',
  '[]': 'Potential',
}

const avatarSkillDesTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarSkillDesTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarSkillDesTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
