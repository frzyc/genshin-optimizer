import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '1': 'Slot',
  '31000': 'EquipmentId',
  '31021': 'EquipmentPieceId',
  '"UI/Sprite/A1DynamicLoad/IconSuit/UnPacker/SuitWoodpeckerElectro.png"':
    'Icon',
  '"UI/3D/Role/Interface_Prop_Disk_03.prefab"': 'todo-EBJPFNJCHEB',
  '"UI/Textures/3DSuit/FrontLabel/WoodpeckerElectro/3DSuitWoodpeckerElectroFrontLabel01.tga"':
    'todo-HHCFFGCBPDO',
  '"UI/Textures/3DSuit/BackLabel/WoodpeckerElectro/3DSuitWoodpeckerElectroBackLabel01.tga"':
    'todo-LNMJMJKJBNA',
  '"UI/Textures/3DSuit/Disk/3DSuitWoodpeckerElectro.tga"': 'todo-EKGGKNNOPHK',
  '"Play_Music_DiaoLv_Icon_Test"': 'todo-ALMHJKJMLKC',
  '"Pause_Music_DiaoLv_Icon_Test"': 'todo-IGEIIIEAGGN',
}

const equipmentTemplateTb = JSON.parse(
  readDMJSON('FileCfg/EquipmentTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(equipmentTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
