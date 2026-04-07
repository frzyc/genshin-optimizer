import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '1': 'Level',
  '2': 'todo-HIMAGELFJFI', // 2-7
  '15': 'MaxLevel',
  '1011': 'AvatarId',
  '1011001': 'PassiveSkillId',
  '"Avatar_PassiveSkill_CoreSkillLevelUp"': 'CoreEnhanceText',
  '[{"MPIANOLFJMB":12201,"AHDPFMHOLPH":6},{"MPIANOLFJMB":12101,"AHDPFMHOLPH":0}]':
    'CoreStats', // TODO: This will change every patch since the property obf names will change
  '["Anbi_UniqueSkill_Title"]': 'Title',
  '["Anbi_UniqueSkill_02_Desc"]': 'Desc',
  '[{"BALDAPBGEPK":10,"AHDPFMHOLPH":5000}]': 'Cost', // TODO: This will change every patch since the property obf names will change
}

const avatarPassiveSkillTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarPassiveSkillTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarPassiveSkillTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
