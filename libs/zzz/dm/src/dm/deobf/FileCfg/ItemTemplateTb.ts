import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '0': 'todo-GMKIIFLFILC-MDDLOBGOLEB-AAJDEBKAJELIdentical-EDPAILDCPLL-FHGOCHDOMFJ',
  '1': 'todo-LFBMAPBEEPL-PGNDMCIELFA-DDLIFFKIMLB',
  '2': 'todo-DIAIMJJLKBG',
  '3': 'todo-KJCANGNFJEI',
  '10': 'todo-HHPGHOAKJJO-GGGFLBIIKFI',
  '10001': 'ItemId', // Maybe
  '"Item_Gold"': 'Name',
  '"Item_Gold_des"': 'Desc',
  '"Item_Gold_story"': 'Story',
  '"Assets/NapResources/UI/Sprite/A1DynamicLoad/ItemIcon/UnPacker/IconCoin.png"':
    'todo-BIOFJBBKIBE',
  '"Assets/NapResources/UI/Sprite/A1DynamicLoad/ItemIconSmall/UnPacker/IconCoin.png"':
    'todo-NAJODJGLLHC',
  '"Assets/NapResources/UI/Sprite/A1DynamicLoad/ItemIconBig/UnPacker/IconCoin.png"':
    'todo-KNKPBOCOAHO',
  '""': 'todo-HMDHLOEHOFK-MEBGDAAMAJH',
  '"Eff_DropItem_Diny"': 'todo-PPOHKDMFJJA',
  '"Eff_DropItem_Diny_Loot"': 'todo-PFMBNHKDBPK-NLPMAJDFKLC',
  '"FirmBox_Diny_Die"': 'todo-AAJBDILEEAF',
  '"ItemBubble_IconCoin"': 'todo-BBNDAIHCFJK',
  '"Assets/NapResources/UI/Sprite/A1DynamicLoad/GroceryType/UnPacker/IconGroceryType04.png"':
    'todo-IJILHCBPIAA',
  '4951609301349985000': 'todo-NGIEBDEJHJL',
  '[]': 'todo-HFELAAHPDMH-OOCNNGJJMAK',
}

const itemTemplateTb = JSON.parse(
  readDMJSON('FileCfg/ItemTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(itemTemplateTb)[0][4]

const mapping = generateMapping(reverseMapping, dmObj)
const typing = generateTyping(reverseMapping, dmObj)

export default {
  mapping,
  typing,
}
