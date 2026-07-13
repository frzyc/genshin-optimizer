import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '0': 'todo-AFOGCPIINNC-KCBNLBGPHJE-CCELPAJBLJH-FBGHPPKLMDM',
  '1': 'todo-PGAMJGAONFO-IHJMKLJCLFD', // IHJMKLJCLFD is WeaponType
  '5': 'todo-FPPNLEKNIHO',
  '300': 'todo-MOAMOCDBKFN',
  '12001': 'WeaponId',
  '20301': 'todo-NKFNONEIAEH',
  '{"MBAPLBKGJGD":12101,"GGGFLBIIKFI":32}': 'MainStat',
  '{"MBAPLBKGJGD":12102,"GGGFLBIIKFI":800}': 'SubStat',
  '"Data/ScriptConfig/Character/Weapon_B_Common"': 'todo-NILEMPMJLGE',
  '"UI/3D/Weapon/Weapon_B_Common_01"': 'todo-KMEPGOJNKDP',
  '"Weapon/Weapon_B_Common_01"': 'todo-OIJDPMFKPOB',
  '"10:7200,101010:2|10:16800,101020:7|10:36000,101020:12|10:60000,101030:6|10:120000,101030:12"':
    'Materials',
  '"Item_Weapon_B_Common_01_Desc"': 'Desc',
  '""': 'todo-BHIGMLPMMIA-LNOKHHPBLHB', // LNOKHHPBLHB is extra story
  '[{"BALDAPBGEPK":10,"AHDPFMHOLPH":1000}]': 'todo-DHGLJOENDHM',
  '"Play_sfx_Weapon_B_Common_2d"': 'todo-GDBDNPBGOKN',
}

const weaponTemplateTb = JSON.parse(
  readDMJSON('FileCfg/WeaponTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(weaponTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
