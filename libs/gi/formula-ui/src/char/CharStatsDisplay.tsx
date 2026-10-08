import { CardThemed } from '@genshin-optimizer/common/ui'
import type { Tag as EngineTag, Read } from '@genshin-optimizer/game-opt/engine'
import {
  FieldDisplayList,
  MultiTagFieldDisplay,
  TagFieldDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { Tag } from '@genshin-optimizer/gi/formula'
import {
  listingJoinId,
  orderCatalogDimKeys,
} from '@genshin-optimizer/gi/formula'
import { ListItem } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import type { CatalogJoinedRow } from '../catalogListing'
import { dimReadForDisplay } from '../catalogListing'
import { TagDisplay } from '../components/TagDisplay'
import { dimLabel } from '../dimLabels'
import { useCharCatalogRows, useGiCalcContext } from '../hooks'
import { OptFormulaSections } from '../OptFormulaSections'
import { pandoCardSx } from '../pandoCardSx'
import { tagToTagField } from '../util'

export function CharStatsDisplay({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const calc = useGiCalcContext()
  const { statRows, categorySections, otherRows } = useCharCatalogRows(
    characterKey,
    calc
  )

  return (
    <CardThemed sx={pandoCardSx}>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        <OptFormulaSections
          characterKey={characterKey}
          statRows={statRows}
          otherRows={otherRows}
          categorySections={categorySections}
          renderRow={(row) => (
            <CatalogFieldRow
              key={`${row.entry.sheet}:${row.entry.name}`}
              row={row}
            />
          )}
        />
      </FieldDisplayList>
    </CardThemed>
  )
}

type DisplayedDim = {
  dim: string
  tag: Tag
  read: Read<Tag>
}

/** WR `total.enerRech_` includes 100% base; Pando `final.enerRech_` is bonus-only. */
function isTotalEnerRechTag(tag: Tag) {
  return tag.qt === 'final' && tag.q === 'enerRech_'
}

function totalEnerRechValue(value: number) {
  return value + 1
}

const CatalogFieldRow = memo(function CatalogFieldRow({
  row,
}: {
  row: CatalogJoinedRow
}) {
  const displayed = useMemo((): DisplayedDim[] => {
    const dims: DisplayedDim[] = []
    for (const dim of orderCatalogDimKeys(row.reads.keys())) {
      const shown = dimReadForDisplay(row, dim)
      if (!shown) continue
      dims.push({ dim, ...shown })
    }
    return dims
  }, [row])

  const readByJoinId = useMemo(() => {
    const map = new Map<string, Read<Tag>>()
    for (const dim of displayed) map.set(listingJoinId(dim.tag), dim.read)
    return map
  }, [displayed])

  const getRead = useCallback(
    (tag: EngineTag) => {
      const key = listingJoinId(tag)
      const read = readByJoinId.get(key)
      if (!read) {
        throw new Error(
          `[gi-formula-ui] CatalogFieldRow: missing read for ${key}`
        )
      }
      return read
    },
    [readByJoinId]
  )

  const valueAdjust = useCallback(
    (tag: EngineTag, value: number) =>
      isTotalEnerRechTag(tag as Tag) ? totalEnerRechValue(value) : value,
    []
  )

  if (!displayed.length) return null

  const title = <TagDisplay tag={displayed[0]!.tag} plain />

  if (displayed.length === 1) {
    const { tag, read } = displayed[0]!
    return (
      <TagFieldDisplay
        field={{
          ...tagToTagField(tag),
          title,
        }}
        calcRead={read}
        valueAdjust={isTotalEnerRechTag(tag) ? totalEnerRechValue : undefined}
        showZero
        component={ListItem}
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
      valueAdjust={valueAdjust}
      showZero
      component={ListItem}
    />
  )
})
