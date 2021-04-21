import characters from './index'
import Formula from '../../Formula'//load the formula processing
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
  toBeValidCharacterSheet(charSheet, characterKey) {
    if (charSheet.formula !== Formula.formulas.character[characterKey]) return {
      message: () => `Character sheet: ${characterKey}.formula is not being brought into Formula properly.`,
      pass: false
    }
    return {
      message: () => `Character sheet: ${characterKey} is valid.`,
      pass: true
    }
  }
})
test('validate character sheet', () => {
  Object.entries(characters).forEach(([characterKey, char]) => {
    Object.keys(char.talent).length && expect(char).toBeValidCharacterSheet(characterKey) //TODO: escape for character with imcomplete characer sheet
    Object.entries(char.talent).forEach(([talentKey, talent]) =>
      talent.document.forEach((section, sectionIndex) =>
        section.fields?.forEach?.((field, fieldIndex) => {
          expect(field).toBeValidField(`${characterKey}.${talentKey}.document[${sectionIndex}].fields[${fieldIndex}]`)
        })))
  })
})
