import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import { describe, expect, it } from 'vitest'
import { orderedFieldCategories } from '../char/fieldCategory'

/** Mirrors category section shaping in `useCharFormulaFields`. */
function shapeCategorySections(
  byCategory: Map<string, Field[]>,
  selectable: (fields: Field[]) => Field[]
) {
  return orderedFieldCategories(byCategory)
    .map(({ category, fields }) => ({
      category,
      fields: selectable(fields),
    }))
    .filter(({ fields }) => fields.length)
}

describe('useCharFormulaFields category sections', () => {
  it('drops sections when selectable removes every field', () => {
    const byCategory = new Map([
      [
        'basic',
        [
          {
            fieldRef: {
              sheet: 'Anby',
              name: 'BasicAttackTurboVolt_0',
              q: 'standardDmg',
            },
          } as Field,
        ],
      ],
    ])
    const sections = shapeCategorySections(byCategory, () => [])
    expect(sections).toEqual([])
  })

  it('keeps sections with selectable fields', () => {
    const fields = [
      {
        fieldRef: {
          sheet: 'Anby',
          name: 'BasicAttackTurboVolt_0',
          q: 'standardDmg',
        },
      } as Field,
    ]
    const byCategory = new Map([['basic', fields]])
    const sections = shapeCategorySections(byCategory, (list) => list)
    expect(sections).toHaveLength(1)
    expect(sections[0]?.fields).toHaveLength(1)
  })
})
