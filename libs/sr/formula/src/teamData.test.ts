import { stackReadTag } from '@genshin-optimizer/game-opt/engine'
import type { TagMapNodeEntries } from './data/util'
import { teamData } from './util'

const STACK_CHANNEL_QTS = new Set(['stackTmp', 'stackOut'])

/** Not in SR tag maps; must not be pinned on stack channels. */
const FOREIGN_STACK_CATS = ['ele', 'move', 'trans', 'amp', 'cata'] as const

function stackChannelEntryTags(entries: TagMapNodeEntries) {
  return entries
    .filter((e) => STACK_CHANNEL_QTS.has(e.tag.qt as string))
    .map((e) => e.tag)
}

function expectNoForeignStackCats(tag: Record<string, unknown>) {
  for (const cat of FOREIGN_STACK_CATS) {
    expect(tag).not.toHaveProperty(cat)
  }
}

describe('non-stacking teamData', () => {
  it('stack channel entries omit foreign listing categories', () => {
    const tags = stackChannelEntryTags(teamData(['March7th']))
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) {
      expectNoForeignStackCats(tag)
    }
  })

  it('stackReadTag is not augmented with stackChannelExtras', () => {
    expect(stackReadTag('static', 'stackIn', '0')).toEqual({
      et: 'own',
      sheet: 'static',
      qt: 'stackIn',
      q: '0',
    })
  })
})
