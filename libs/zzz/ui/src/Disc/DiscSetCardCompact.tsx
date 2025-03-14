'use client'

import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { useMemo } from 'react'
import { ZCard } from '../Components'
import { EmptyCompactCard } from '../util'
import { DiscSetName } from './DiscTrans'

export function DiscSetCardCompact({
  discs,
}: {
  discs: Record<DiscSlotKey, ICachedDisc | undefined>
}) {
  const sets = useMemo(() => {
    const sets: Partial<Record<DiscSetKey, number>> = {}
    Object.values(discs).forEach((disc) => {
      const setKey = disc?.setKey
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
  }, [discs])

  return sets && Object.keys(sets).length ? (
    <ZCard
      bgt="dark"
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <Box component="div" sx={{ px: '8px', py: '6px' }}>
        <Stack spacing={1}>
          {/* TODO: translate */}
          {Object.entries(sets).map(([key, count]) => (
            <Box
              key={key}
              component="div"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#2B364D',
                py: '16px',
                px: '5px',
                borderRadius: '12px',
              }}
            >
              <Box
                component="div"
                sx={{ display: 'flex', alignItems: 'center' }}
                gap={2}
              >
                <ImgIcon size={2.5} src={discDefIcon(key)} />
                <Typography key={key} sx={{ fontWeight: '900' }}>
                  <DiscSetName setKey={key} />
                </Typography>
              </Box>
              <SqBadge
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#46A046',
                  px: '10px',
                  py: '5px',
                  fontWeight: '900',
                }}
              >
                {count}pc
              </SqBadge>
            </Box>
          ))}
        </Stack>
      </Box>
    </ZCard>
  ) : (
    // TODO: Translate
    <EmptyCompactCard placeholder="No Active Sets" />
  )
}
