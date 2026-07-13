import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '0': 'todo-GHCEAHCKJHO-DNAEMGCOBHPIdentical-JHEGJGGMHAIIdentical-FACPPINEHAD-IPFKJOHLJFEIdentical-EPACGGDHFALIdentical-FMHHHFOONJIIdentical-CCNCIGHNFFE-JIPLNPMALNH-BGHIODFFBEDIdentical-BOALFCIAFOCIdentical-AGBDJDBGOBJ-EJGJEHCBKAMIdentical-DPGNCMJNHPKIdentical', // JHEGJGGMHAI is probably SpRecoveryGrowth (unused/always 0). TODO: CCNCIGHNFFE is AttributeInfliction
  '80': 'StunRatioGrowth',
  '290': 'DamagePercentageGrowth',
  '1559': 'EtherPurify',
  '1560': 'StunRatio',
  '3120': 'DamagePercentage',
  '5620': 'SpRecovery',
  '42900': 'FeverRecovery',
  '1011001': 'SkillId',
  '""': 'DistanceAttenuation',
  '[]': 'todo-GLFAPAPGDLA',
}

const avatarSkillTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarSkillTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarSkillTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
