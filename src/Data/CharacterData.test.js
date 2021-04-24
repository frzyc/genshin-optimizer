import { CharacterData, CharacterDataImport } from "./CharacterData"

beforeEach(() => {
  return CharacterDataImport
})
test('should import chars', () => {
  expect(Object.keys(CharacterData).length).toBeGreaterThan(0)
})

const stats = {
  constellation: 6,
  ascension: 6,
  tlvl: { auto: 14, skill: 14, burst: 14 }
}
test('should Have genernal format', () => {
  Object.values(CharacterData).forEach(char => {
    if (!Object.keys(char.talent)) return //has sheet //TODO: remove when all chararacter sheets are complete
    Object.values(char.talent).forEach(talent => {
      expect(Array.isArray(talent.document)).toBeTruthy()
      talent.document.forEach(section => {
        if (section.fields) {
          expect(Array.isArray(section.fields)).toBeTruthy()
          section.fields.forEach(field => {
            if (field.formula) expect(field.formulaText).toBeTruthy()
          })
        }
      })
    })
  });
})

