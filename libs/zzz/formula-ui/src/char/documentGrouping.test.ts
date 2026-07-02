import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { describe, expect, it } from 'vitest'
import { groupDocumentsByHeader } from './documentGrouping'

describe('groupDocumentsByHeader', () => {
  it('splits on text documents with headers', () => {
    const documents: Document[] = [
      {
        type: 'text',
        header: { icon: null, text: 'A' },
        text: 'desc a',
      },
      { type: 'fields', fields: [] },
      {
        type: 'text',
        header: { icon: null, text: 'B' },
        text: 'desc b',
      },
    ]

    expect(groupDocumentsByHeader(documents)).toEqual([
      [documents[0], documents[1]],
      [documents[2]],
    ])
  })
})
