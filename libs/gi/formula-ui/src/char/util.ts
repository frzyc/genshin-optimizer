import type {
  Document,
  TextDocument,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { characterAsset, imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerFKeys, travelerMKeys } from '@genshin-optimizer/gi/consts'
import { getCharStat } from '@genshin-optimizer/gi/stats'
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

  return {
    chg,
    ch,
    talentTem: (talentKey: TalentSheetElementKey, docSections?: Document[]) =>
      talentTemplate(characterKey, talentKey, chg, docSections),
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

/** Talent / constellation icon for sheet section headers and opt category headings. */
export function talentSheetElementIcon(
  characterKey: CharacterKey,
  talentKey: TalentSheetElementKey
): string {
  if (talentKey === 'auto') {
    const wKey = getCharStat(characterKey).weaponType
    return imgAssets.weaponTypes[wKey]
  }
  return characterAsset(characterKey, talentKey, 'F')
}

/** Same icon + `char_*_gen` talent name used by `talentTem` and opt category headers. */
export function talentSheetElement(
  characterKey: CharacterKey,
  talentKey: TalentSheetElementKey
): { img: string; title: ReactNode } {
  const [chg] = trans('char', characterKey as CharacterSheetKey)
  return {
    img: talentSheetElementIcon(characterKey, talentKey),
    title: chg(`${talentKey}.name`),
  }
}

const talentTemplate = (
  characterKey: CharacterKey,
  talentKey: TalentSheetElementKey,
  tr: (i18key: string) => ReactNode,
  documents?: Document[]
): UISheetElement => {
  const { img, title } = talentSheetElement(characterKey, talentKey)
  return {
    title,
    img,
    documents: [
      ...(talentKey !== 'auto'
        ? [
            {
              type: 'text',
              text: tr(`${talentKey}.description`),
            } as TextDocument,
          ]
        : []),
      ...(documents || []),
    ],
  }
}

function charSheetKeyToCharKey(csk: CharacterSheetKey): CharacterKey {
  if (
    travelerFKeys.includes(csk as (typeof travelerFKeys)[number]) ||
    travelerMKeys.includes(csk as (typeof travelerMKeys)[number])
  )
    return csk.slice(0, -1) as CharacterKey
  else return csk as CharacterKey
}
