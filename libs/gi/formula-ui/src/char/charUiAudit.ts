import type { Field, UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import type { TalentSheetElementKey } from './consts'

/** Keys that must pass full audit in `charUiSheets.test.ts` (merge gate). */
export const CHAR_UI_AUDIT_KEYS = [
  'Aino',
  'Albedo',
  'Alhaitham',
  'Aloy',
  'Alyosha',
  'Amber',
  'AratakiItto',
  'Arlecchino',
  'Baizhu',
  'Barbara',
  'Beidou',
  'Bennett',
  'Candace',
  'Charlotte',
  'Chasca',
  'Chevreuse',
  'Chiori',
  'Chongyun',
  'Citlali',
  'Clorinde',
  'Collei',
  'Columbina',
  'Cyno',
  'Dahlia',
  'Dehya',
  'Diluc',
  'Diona',
  'Dori',
  'Durin',
  'Emilie',
  'Escoffier',
  'Eula',
  'Faruzan',
  'Fischl',
  'Flins',
  'Freminet',
  'Furina',
  'Gaming',
  'Ganyu',
  'Gorou',
  'HuTao',
  'Iansan',
  'Ifa',
  'Illuga',
  'Ineffa',
  'Jahoda',
  'Jean',
  'Kachina',
  'KaedeharaKazuha',
  'Kaeya',
  'KamisatoAyaka',
  'KamisatoAyato',
  'Kaveh',
  'Keqing',
  'Kinich',
  'Kirara',
  'Klee',
  'KujouSara',
  'KukiShinobu',
  'LanYan',
  'Lauma',
  'Layla',
  'Linnea',
  'Lisa',
  'Lohen',
  'Lynette',
  'Lyney',
  'Mavuika',
  'Mika',
  'Mona',
  'Mualani',
  'Nahida',
  'Navia',
  'Nefer',
  'Neuvillette',
  'Nicole',
  'Nilou',
  'Ningguang',
  'Noelle',
  'Odette',
  'Ororon',
  'Prune',
  'Qiqi',
  'RaidenShogun',
  'Razor',
  'Rosaria',
  'Sandrone',
  'SangonomiyaKokomi',
  'Sayu',
  'Sethos',
  'Shenhe',
  'ShikanoinHeizou',
  'Sigewinne',
  'Skirk',
  'Somnia',
  'Sucrose',
  'Tartaglia',
  'Thoma',
  'Tighnari',
  'TravelerAnemo',
  'TravelerCryo',
  'TravelerDendro',
  'TravelerElectro',
  'TravelerGeo',
  'TravelerHydro',
  'TravelerPyro',
  'Varesa',
  'Varka',
  'Venti',
  'Wanderer',
  'Wriothesley',
  'Xiangling',
  'Xianyun',
  'Xiao',
  'Xilonen',
  'Xingqiu',
  'Xinyan',
  'YaeMiko',
  'Yanfei',
  'Yaoyao',
  'Yelan',
  'Yoimiya',
  'YumemizukiMizuki',
  'YunJin',
  'Zhongli',
  'Zibai',
] as const satisfies readonly CharacterKey[]

export type CharUiAuditKey = (typeof CHAR_UI_AUDIT_KEYS)[number]

export function collectConditionalNames(
  sheet: UISheet<TalentSheetElementKey>
): string[] {
  const names: string[] = []
  for (const section of Object.values(sheet)) {
    for (const doc of section?.documents ?? []) {
      if (doc.type === 'conditional') names.push(doc.conditional.metadata.name)
    }
  }
  return names
}

export function collectFieldRefs(
  sheet: UISheet<TalentSheetElementKey>
): Field[] {
  const fields: Field[] = []
  for (const section of Object.values(sheet)) {
    for (const doc of section?.documents ?? []) {
      if (doc.type === 'fields') fields.push(...doc.fields)
      if (doc.type === 'conditional')
        fields.push(...(doc.conditional.fields ?? []))
    }
  }
  return fields
}

export function validateCharUiSheet(
  characterKey: CharacterKey,
  sheet: UISheet<TalentSheetElementKey>
): string[] {
  const errors: string[] = []
  const sheetConds =
    (conditionals as Record<string, Record<string, unknown>>)[characterKey] ??
    {}
  const sheetFormulas =
    (formulas as Record<string, Record<string, { tag: { name: string } }>>)[
      characterKey
    ] ?? {}

  const condNames = new Set(collectConditionalNames(sheet))
  for (const name of Object.keys(sheetConds)) {
    if (!condNames.has(name))
      errors.push(`missing conditional document for ${name}`)
  }

  for (const field of collectFieldRefs(sheet)) {
    if (isTagField(field)) {
      const listing = field.fieldRef.name
      if (!listing || !sheetFormulas[listing])
        errors.push(`fieldRef ${listing ?? '<missing name>'} not in formulas`)
      continue
    }
    if (isMultiTagField(field)) {
      for (const { ref } of field.fieldRefs) {
        const listing = ref.name
        if (!listing || !sheetFormulas[listing])
          errors.push(`fieldRef ${listing ?? '<missing name>'} not in formulas`)
      }
    }
  }

  return errors
}
