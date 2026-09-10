import { classifyPandoSheet, parsePandoListingNames } from './sheetScan'

test('parsePandoListingNames', () => {
  const src = `
    dmg('normal_0', info, 'atk', dm.normal.hitArr[0], 'normal'),
    customDmg('karma_dmg', info, sum(...)),
    customHeal('heal', prod(...)),
  `
  expect(parsePandoListingNames(src)).toEqual(['heal', 'karma_dmg', 'normal_0'])
})

test('classify ignores util-only files conceptually via stub markers', () => {
  expect(classifyPandoSheet('weapon', '// TODO: Conditionals\n').status).toBe(
    'stub'
  )
})
