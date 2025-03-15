import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import type { TalentSheet, TalentSheetElementKey } from './ICharacterSheet'

export type AllCharacterSheets = (
  characterkey: CharacterKey,
  gender: GenderKey,
) => CharacterSheet
export class CharacterSheet {
  readonly sheet: TalentSheet
  readonly data: Data
  constructor(charSheet: TalentSheet, data: Data) {
    this.sheet = charSheet
    this.data = data
  }
  get talent() {
    return this.sheet
  }
  getTalentOfKey = (talentKey: TalentSheetElementKey) => this.talent[talentKey]
}
