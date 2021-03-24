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
    expect(Object.keys(char)).toEqual(expect.arrayContaining(["name", "star", "elementKey", "weaponTypeKey", "baseStat", "specializeStat"]))
    if (!char.talent) return //has sheet
    expect(Object.keys(char.talent)).toEqual(expect.arrayContaining(["auto", "skill", "burst", "passive1", "passive2", "passive3", "constellation1", "constellation2", "constellation3", "constellation4", "constellation5", "constellation6"]))
    Object.values(char.talent).forEach(talent => {
      expect(Array.isArray(talent.document)).toBeTruthy()
      talent.document.forEach(section => {
        if (typeof section === "function") section = section(stats)
        if (section) expect(typeof section === "object").toBeTruthy()
        if (section.fields) {
          expect(Array.isArray(section.fields)).toBeTruthy()
          section.fields.forEach(field => {
            if (typeof field === "function") field = field(stats)
            if (!field) return
            expect(field.text).toBeTruthy()
            if (field.formula) expect(field.formulaText).toBeTruthy()
          })
        }
      })
    })
  });
})

