import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardThemed, SqBadge, useRefSize } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { type DiscIds } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext, useDiscs } from '@genshin-optimizer/zzz/db-ui'
import { Box, Typography, useTheme } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import {
  COMPACT_ELE_HEIGHT,
  COMPACT_ELE_WIDTH,
  COMPACT_ELE_WIDTH_NUMBER,
} from '../compactConst'
import { DiscCard, DiscSetName } from '../Disc'
import { WengineCard } from '../Wengine'
/**
 * @deprecated use EquippedGrid, probably after adding the set effect item and more flexible grid, with smaller cards
 */
export function EquipRow({
  discIds,
  wengineId,
}: {
  discIds: DiscIds
  wengineId?: string
}) {
  const { database } = useDatabaseContext()
  const sets = useMemo(() => {
    const sets: Partial<Record<DiscSetKey, number>> = {}
    Object.values(discIds).forEach((discId) => {
      const setKey = database.discs.get(discId)?.setKey
      if (!setKey) return
      sets[setKey] = (sets[setKey] || 0) + 1
    })
    return Object.fromEntries(
      Object.entries(sets)
        .map(([setKey, count]): [DiscSetKey, number] => {
          if (count >= 4) return [setKey as DiscSetKey, 4]
          if (count >= 2) return [setKey as DiscSetKey, 2]
          return [setKey as DiscSetKey, 0]
        })
        .filter(([, count]) => count > 0)
    ) as Partial<Record<DiscSetKey, 2 | 4>>
  }, [database.discs, discIds])

  // Calculate how many rows is needed for the layout
  const [rows, setRows] = useState(2)
  const { ref, width } = useRefSize()
  const theme = useTheme()
  useEffect(() => {
    if (!ref.current || !width) return
    const fontSize = parseFloat(window.getComputedStyle(ref.current).fontSize)
    const spacing = parseFloat(theme.spacing(1))
    const eleWidthPx = fontSize * COMPACT_ELE_WIDTH_NUMBER
    const numCols =
      Math.floor((width - eleWidthPx) / (eleWidthPx + spacing)) + 1
    const numRows = Math.ceil(8 / numCols) // 6 disc + set + lc
    setRows(numRows)
  }, [ref, theme, width])
  const discs = useDiscs(discIds)
  return (
    <Box
      ref={ref}
      sx={{
        display: 'grid',
        gap: 1,
        boxSizing: 'border-box',
        gridTemplateColumns: `repeat(auto-fit,${COMPACT_ELE_WIDTH})`,
        gridAutoFlow: 'column',
        gridTemplateRows: `repeat(${rows}, ${COMPACT_ELE_HEIGHT})`,
        maxWidth: '100%',
        width: '100%',
      }}
    >
      {wengineId && <WengineCard wengineId={wengineId} />}
      <DiscSetCardCompact bgt="light" sets={sets} />
      {Object.values(discs)
        .filter(notEmpty)
        .map((d) => (
          <DiscCard key={d.slotKey} disc={d} />
        ))}
    </Box>
  )
}

function DiscSetCardCompact({
  sets,
  bgt,
}: {
  sets: Partial<Record<DiscSetKey, 2 | 4>>
  bgt?: CardBackgroundColor
}) {
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        width: COMPACT_ELE_WIDTH,
        height: COMPACT_ELE_HEIGHT,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* TODO: translate */}
        {!Object.keys(sets).length && <Typography>No Disc sets</Typography>}
        {Object.entries(sets).map(([key, count]) => (
          <Typography key={key}>
            <SqBadge>{count}</SqBadge> <DiscSetName setKey={key} />
          </Typography>
        ))}
      </Box>
    </CardThemed>
  )
}
