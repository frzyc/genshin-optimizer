import { useRefSize } from '@genshin-optimizer/common/ui'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import { type RelicIds } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { Box, useTheme } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import {
  COMPACT_ELE_HEIGHT,
  COMPACT_ELE_WIDTH,
  COMPACT_ELE_WIDTH_NUMBER,
} from '../compactConst'
import { LightConeCardCompact } from '../LightCone'
import { RelicCardCompact, RelicSetCardCompact } from '../Relic'
export function EquipRow({
  relicIds,
  lightConeId,
}: {
  relicIds: RelicIds
  lightConeId?: string
}) {
  const { database } = useDatabaseContext()
  const sets = useMemo(() => {
    const sets: Partial<Record<RelicSetKey, number>> = {}
    Object.values(relicIds).forEach((relicId) => {
      const setKey = database.relics.get(relicId)?.setKey
      if (!setKey) return
      sets[setKey] = (sets[setKey] || 0) + 1
    })
    return Object.fromEntries(
      Object.entries(sets)
        .map(([setKey, count]): [RelicSetKey, number] => {
          if (count >= 4) return [setKey as RelicSetKey, 4]
          if (count >= 2) return [setKey as RelicSetKey, 2]
          return [setKey as RelicSetKey, 0]
        })
        .filter(([, count]) => count > 0),
    ) as Partial<Record<RelicSetKey, 2 | 4>>
  }, [database.relics, relicIds])

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
    const numRows = Math.ceil(8 / numCols) // 6 relic + set + lc
    setRows(numRows)
  }, [ref, theme, width])
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
      <LightConeCardCompact bgt="light" lightConeId={lightConeId} />
      <RelicSetCardCompact bgt="light" sets={sets} />
      {allRelicSlotKeys.map((slot) => (
        <RelicCardCompact
          key={slot}
          bgt="light"
          relicId={relicIds[slot]}
          slotKey={slot}
          showLocation
        />
      ))}
    </Box>
  )
}
