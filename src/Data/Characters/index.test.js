import characters from './index'
import Formula from '../../Formula'//load the formula processing
expect.extend({
  toBeValidField(field, fieldStr) {
    if (typeof field !== "object") return {
      message: () => `field ${fieldStr} should not be a function. Use field.canShow: stats=>{...} to limit showing of field.`,
      pass: false
    }
    if (field.condition) return {
      message: () => `field ${fieldStr}.condition should not exit.`,
      pass: false
    }
    if (typeof field.canShow !== "function") return {
      message: () => `field ${fieldStr}.canShow is not a function. This function should determine if a field should be shown, or be omiited.`,
      pass: false
    }
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
  toBeValidCharacterSheet(charSheet, characterKey) {//TODO: add validation for other stuff in character sheet as well?
    if (!charSheet.conditionals) return {
      message: () => `Character sheet: ${characterKey}.conditionals is lacking.`,
      pass: false
    }
    if (!charSheet.formula) return {
      message: () => `Character sheet: ${characterKey}.formula is lacking.`,
      pass: false
    }
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
    expect(char).toBeValidCharacterSheet(characterKey)
    Object.entries(char.talent ?? {}).forEach(([talentKey, talent]) => //TODO: escape for character with imcomplete characer sheet
      talent.document.forEach((section, sectionIndex) =>
        section.fields?.forEach?.((field, fieldIndex) => {
          expect(field).toBeValidField(`${characterKey}.${talentKey}.document[${sectionIndex}].fields[${fieldIndex}]`)
        })))
  })
})
