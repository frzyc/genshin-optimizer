import type { Read, Tag } from '@genshin-optimizer/game-opt/engine'
import {
  FieldDisplayList,
  MultiTagFieldDisplay,
  TagFieldDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { FormulaRef, Tag as ZzzTag } from '@genshin-optimizer/zzz/formula'
import { listingJoinId, sameFormula } from '@genshin-optimizer/zzz/formula'
import {
  getHighlightRGBA,
  isHighlight,
  StatHighlightContext,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import { ListItem } from '@mui/material'
import { memo, useCallback, useContext, useMemo } from 'react'
import type { CatalogJoinedRow } from '../catalogListing'
import { dimReadForDisplay } from '../catalogListing'
import { TagTitle } from '../components/TagTitle'
import { dimLabel } from '../dimLabels'
import {
  useCharCatalogRows,
  useOptCategoryCollapse,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '../hooks'
import { statKeyFromListingTag } from '../listingStatLabels'
import { OptFormulaSections } from '../OptFormulaSections'
import { optTargetRowSx } from '../OptTargetTagRowSxProvider'

export function CharStatsDisplay() {
  const character = useCharacterContext()
  const calc = useZzzCalcContext()
  const collapse = useOptCategoryCollapse()
  const { ref: optRef } = useResolvedOptTarget()
  const { statRows, categorySections, otherRows } = useCharCatalogRows(
    character?.key,
    calc
  )

  return (
    <ZCard>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        <OptFormulaSections
          statRows={statRows}
          otherRows={otherRows}
          categorySections={categorySections}
          collapse={collapse}
          renderRow={(row) => (
            <CatalogFieldRow
              key={`${row.entry.sheet}:${row.entry.name}`}
              row={row}
              optRef={optRef}
            />
          )}
        />
      </FieldDisplayList>
    </ZCard>
  )
}

type DisplayedDim = {
  dim: string
  tag: ZzzTag
  read: Read<ZzzTag>
}

const CatalogFieldRow = memo(function CatalogFieldRow({
  row,
  optRef,
}: {
  row: CatalogJoinedRow
  optRef: FormulaRef | undefined
}) {
  const { entry, reads } = row
  const displayed = useMemo((): DisplayedDim[] => {
    const dims: DisplayedDim[] = []
    for (const dim of reads.keys()) {
      const shown = dimReadForDisplay({ entry, reads }, dim, optRef)
      if (!shown) continue
      dims.push({ dim, ...shown })
    }
    return dims
  }, [entry, reads, optRef])

  const readByJoinId = useMemo(() => {
    const map = new Map<string, Read<ZzzTag>>()
    for (const dim of displayed) map.set(listingJoinId(dim.tag), dim.read)
    return map
  }, [displayed])

  const getRead = useCallback(
    (tag: Tag) => {
      const key = listingJoinId(tag)
      const read = readByJoinId.get(key)
      if (!read) {
        throw new Error(
          `[zzz-formula-ui] CatalogFieldRow: missing read for ${key}`
        )
      }
      return read
    },
    [readByJoinId]
  )

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const sampleTag = displayed[0]?.tag
  const tagQStatKey = sampleTag ? statKeyFromListingTag(sampleTag) : ''
  const isHL = tagQStatKey ? isHighlight(statHighlight, tagQStatKey) : false
  const isOpt = sameFormula(optRef, entry)

  const onMouseEnter = useCallback(() => {
    if (tagQStatKey) setStatHighlight(tagQStatKey)
  }, [tagQStatKey, setStatHighlight])
  const onMouseLeave = useCallback(() => {
    setStatHighlight('')
  }, [setStatHighlight])

  const rowSx = useMemo(
    () => ({
      ...(isOpt ? optTargetRowSx : {}),
      position: 'relative' as const,
      '::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: getHighlightRGBA(isHL),
        transition: 'background-color 0.3s ease-in-out',
        pointerEvents: 'none' as const,
      },
    }),
    [isHL, isOpt]
  )

  if (!displayed.length) return null

  const title = <TagTitle tag={displayed[0]!.tag} />

  if (displayed.length === 1) {
    const { tag, read } = displayed[0]!
    return (
      <TagFieldDisplay
        field={{ title, fieldRef: tag }}
        calcRead={read}
        showZero
        component={ListItem}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        rowSx={rowSx}
      />
    )
  }

  return (
    <MultiTagFieldDisplay
      field={{
        title,
        fieldRefs: displayed.map(({ dim, tag }) => ({
          label: dimLabel(dim),
          ref: tag,
        })),
      }}
      getRead={getRead}
      showZero
      component={ListItem}
      rowSx={rowSx}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
})
