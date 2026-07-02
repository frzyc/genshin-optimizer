import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'

/** Group flat sheet docs by titled text sections (ability, core, mindscape, …). */
export function groupDocumentsByHeader(documents: Document[]): Document[][] {
  const groups: Document[][] = []
  let current: Document[] = []

  for (const doc of documents) {
    if (doc.type === 'text' && doc.header && current.length > 0) {
      groups.push(current)
      current = []
    }
    current.push(doc)
  }
  if (current.length) groups.push(current)

  return groups
}
