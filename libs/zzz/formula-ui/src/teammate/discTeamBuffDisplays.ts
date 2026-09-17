import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { discUiSheets } from '../disc/sheets'

export type DiscDisplay = {
  setKey: DiscSetKey
  pieces: { piece: '2' | '4'; documents: Document[] }[]
}

export function discDisplaysFromSets(
  sets: Partial<Record<DiscSetKey, number>>,
  filterTeamBuffDocuments: (documents: Document[]) => Document[]
): DiscDisplay[] {
  // Disc UI is split by 2pc/4pc; include only pieces with relevant team-buff rows.
  return Object.entries(sets).flatMap(([setKey, count]) => {
    if (!count) return []
    const uiSheet = discUiSheets[setKey as DiscSetKey]
    if (!uiSheet) return []

    const pieces = Object.entries(uiSheet).flatMap(([piece, section]) => {
      if (piece !== '2' && piece !== '4') return []
      const minPieces = piece === '2' ? 2 : 4
      if (count < minPieces) return []
      const documents = filterTeamBuffDocuments(section?.documents ?? [])
      if (!documents.length) return []
      return [{ piece: piece as '2' | '4', documents }]
    })

    if (!pieces.length) return []
    return [{ setKey: setKey as DiscSetKey, pieces }]
  })
}
