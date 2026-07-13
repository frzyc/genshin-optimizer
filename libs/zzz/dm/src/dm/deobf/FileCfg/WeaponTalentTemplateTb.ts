import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '1': 'WeaponType',
  '12001': 'WeaponId',
  '"Weapon_TalentTitle_12001"': 'Title',
  '"Weapon_TalentDes_81200101"': 'Desc',
  '[81200101]': 'AbilityConfigIds',
  '[false]': 'todo-FKLPKKIIGNL',
}

const weaponTalentTemplateTb = JSON.parse(
  readDMJSON('FileCfg/WeaponTalentTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(weaponTalentTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
