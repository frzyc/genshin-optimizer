import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { describe, expect, it } from 'vitest'
import {
  CHAR_UI_AUDIT_KEYS,
  collectConditionalNames,
  validateCharUiSheet,
} from './charUiAudit'
import { uiSheets } from './sheets'

describe('charUiSheets audit', () => {
  for (const characterKey of CHAR_UI_AUDIT_KEYS) {
    describe(characterKey, () => {
      it('has a UISheet', () => {
        expect(uiSheets[characterKey]).toBeDefined()
      })

      it('covers all formula conditionals', () => {
        const sheet = uiSheets[characterKey]!
        const errors = validateCharUiSheet(characterKey, sheet)
        expect(errors, errors.join('\n')).toEqual([])
      })

      it('uses ReactNode cond labels for bool/list/num rows', () => {
        const sheet = uiSheets[characterKey]!
        for (const section of Object.values(sheet)) {
          for (const doc of section?.documents ?? []) {
            if (doc.type !== 'conditional') continue
            expect(typeof doc.conditional.label).not.toBe('string')
            if (
              doc.conditional.metadata.type === 'list' ||
              doc.conditional.metadata.type === 'num'
            )
              expect(typeof doc.conditional.badge).toBe('function')
          }
        }
      })
    })
  }

  it('lists every audited key in uiSheets', () => {
    const missing = CHAR_UI_AUDIT_KEYS.filter((key) => !uiSheets[key])
    expect(missing).toEqual([])
  })
})

describe('charUiSheets registry', () => {
  it('exports only valid character keys', () => {
    for (const key of Object.keys(uiSheets) as CharacterKey[]) {
      expect(collectConditionalNames(uiSheets[key]!)).toBeDefined()
    }
  })

  it('audits every exported sheet', () => {
    const unaudited = (Object.keys(uiSheets) as CharacterKey[]).filter(
      (key) => !CHAR_UI_AUDIT_KEYS.includes(key as never)
    )
    expect(unaudited).toEqual([])
  })
})
