import characters from './index'
import Formula from '../../Formula'//load the formula processing
import { ICharacterSheet } from '../../Types/character'
import { CharacterKey } from '../../Types/consts'
expect.extend({
  toBeValidField(field, fieldStr) {
    if (field.formula && !field.formula.keys) return {
      message: () => `field ${fieldStr}.formula.keys is not valid. Should be added during formula processing.`,
      pass: false
    }
    if (field.formula && field.formula.field !== field) return {
      message: () => `field ${fieldStr}.formula.field is not valid. Should be added during formula processing, pointing to this field.`,
      pass: false
    }
    if (field.formula && !field.formulaText) return {
      message: () => `field ${fieldStr}.formula must be accompanies with a .formulaText.`,
      pass: false
    }
    return {
      message: () => `field ${fieldStr} is valid.`,
      pass: true
    }
  },
  async toBeValidCharacterSheet(charSheet: ICharacterSheet, characterKey: CharacterKey) {
    if ("talent" in charSheet) {
      const charformula = await Formula.get(["character", characterKey])
      if (charSheet.talent.formula !== charformula) return {
        message: () => `Character sheet: ${characterKey}.formula is not being brought into Formula properly.`,
        pass: false
      }
    } else {
      for (const eleKey of Object.keys(charSheet.talents)) {
        const talentSheet = charSheet.talents[eleKey]
        if (!talentSheet) continue
        const charformula = await Formula.get(["character", characterKey, eleKey])
        if (talentSheet.formula !== charformula) return {
          message: () => `Character sheet: ${characterKey}.${eleKey}.formula is not being brought into Formula properly.`,
          pass: false
        }
      }

    }

    return {
      message: () => `Character sheet: ${characterKey} is valid.`,
      pass: true
    }
  }
})
test('validate character sheet', () => {
  Object.entries(characters).forEach(([characterKey, char]) => {
    expect(char).toBeValidCharacterSheet(characterKey)
    if ("talent" in char)
      Object.entries(char.talent.sheets).forEach(([talentKey, talent]) =>
        talent.sections.forEach((section, sectionIndex) =>
          section.fields?.forEach?.((field, fieldIndex) => {
            expect(field).toBeValidField(`${characterKey}.${talentKey}.sections[${sectionIndex}].fields[${fieldIndex}]`)
          })))
    else //char.talents -> traveler
      Object.entries(char.talents).forEach(([eleKey, talentSheet]) =>
        Object.entries(talentSheet.sheets).forEach(([talentKey, talent]) =>
          talent.sections.forEach((section, sectionIndex) =>
            section.fields?.forEach?.((field, fieldIndex) => {
              expect(field).toBeValidField(`${characterKey}.${eleKey}.${talentKey}.sections[${sectionIndex}].fields[${fieldIndex}]`)
            }))))
  })
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidField(fieldStr): any
      toBeValidCharacterSheet(characterKey)
    }
  }
}
