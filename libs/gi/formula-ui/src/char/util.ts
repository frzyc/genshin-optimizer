import type {
  Document,
  TextDocument,
  UISheetElement,
} from '@genshin-optimizer/gameOpt/sheet-ui'
import { characterAsset, imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerFKeys, travelerMKeys } from '@genshin-optimizer/gi/consts'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'
import { trans } from '../util'
import type { TalentSheetElementKey } from './consts'
export interface ICharacterTemplate {
  chg: (i18key: string) => ReactNode
  ch: (i18key: string) => ReactNode
  talentTem: (
    talentKey: TalentSheetElementKey,
    docSections?: Document[]
  ) => UISheetElement
  // headerTem: (
  //   talentKey: TalentSheetElementKey,
  //   partialSection: DocumentSection
  // ) => DocumentSection
  // fieldsTem: (
  //   talentKey: TalentSheetElementKey,
  //   partialFields: IDocumentFields
  // ) => IDocumentFields
  // condTem: (
  //   talentKey: TalentSheetElementKey,
  //   partialCond: DocumentConditionalBase
  // ) => DocumentConditional
}
export const charTemplates = (cKey: CharacterSheetKey): ICharacterTemplate => {
  const [chg, ch] = trans('char', cKey)
  const characterKey = charSheetKeyToCharKey(cKey)
  const wKey = getCharStat(characterKey).weaponType

  const img = (tk: TalentSheetElementKey) => {
    if (tk === 'auto') return imgAssets.weaponTypes[wKey]
    return characterAsset(characterKey, tk, 'F') // Should be all genderless assets
  }

  return {
    chg,
    ch,
    talentTem: (talentKey: TalentSheetElementKey, docSections?: Document[]) =>
      talentTemplate(talentKey, chg, img(talentKey), docSections),
    // headerTem: (
    //   talentKey: TalentSheetElementKey,
    //   partialSection: DocumentSection
    // ) => headerTemplate(talentKey, chg, img(talentKey), partialSection),
    // fieldsTem: (
    //   talentKey: TalentSheetElementKey,
    //   partialFields: IDocumentFields
    // ) => fieldsTemplate(talentKey, partialFields),
    // condTem: (
    //   talentKey: TalentSheetElementKey,
    //   partialCond: DocumentConditionalBase
    // ) => conditionalTemplate(talentKey, partialCond, chg, img(talentKey)),
  }
}

const talentTemplate = (
  talentKey: TalentSheetElementKey,
  tr: (i18key: string) => ReactNode,
  img: string | StaticImageData,
  documents?: Document[]
): UISheetElement => ({
  title: tr(`${talentKey}.name`),
  img,
  documents: [
    ...(talentKey !== 'auto'
      ? [{ type: 'text', text: tr(`${talentKey}.description`) } as TextDocument]
      : []),
    ...(documents || []),
  ],
})

function charSheetKeyToCharKey(csk: CharacterSheetKey): CharacterKey {
  if (
    travelerFKeys.includes(csk as (typeof travelerFKeys)[number]) ||
    travelerMKeys.includes(csk as (typeof travelerMKeys)[number])
  )
    return csk.slice(0, -1) as CharacterKey
  else return csk as CharacterKey
}
