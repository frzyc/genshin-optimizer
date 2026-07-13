import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  1011: 'AvatarId',
  Avatar_Female_Size02_Anbi_En: 'FullName',
  Avatar_Female_Size02_Anbi: 'ShortName',
  Avatar_Female_Size02_Anbi_FullName: 'FullName2',
  anbi: 'InternalName',
  'BK_Anbi|BK_CHR_Common|BK_Anbi_VO': 'Unknown1',
  2: 'Gender',
  1: 'Camp',
  Anbi: 'InternalName2',
  10101: 'UnknownId',
}

const avatarBaseTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarBaseTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarBaseTemplateTb)[0][0]
const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
