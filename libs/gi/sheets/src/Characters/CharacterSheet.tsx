import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import type { ICharacterSheet, TalentSheetElementKey } from './ICharacterSheet'

export type AllCharacterSheets = (
  characterkey: CharacterKey,
  gender: GenderKey
) => CharacterSheet
export class CharacterSheet {
  readonly sheet: ICharacterSheet
  readonly data: Data
  constructor(charSheet: ICharacterSheet, data: Data) {
    this.sheet = charSheet
    this.data = data
  }
  get talent() {
    return this.sheet.talent
  }
  getTalentOfKey = (talentKey: TalentSheetElementKey) => this.talent[talentKey]
}
