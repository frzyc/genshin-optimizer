'use client'

import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ZCard } from '../Components'
import { EmptyCompactCard } from '../util'
import { DiscSetName } from './DiscTrans'

export function DiscSetCardCompact({
  discs,
}: {
  discs: Record<DiscSlotKey, ICachedDisc | undefined>
}) {
  const { t } = useTranslation('disc')
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
        width: '100%',
      }}
    >
      <Box component="div" sx={{ p: '4px' }}>
        <Stack spacing={1.2}>
          {/* TODO: translate */}
          {Object.entries(sets).map(([key, count]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#2B364D',
                py: '12px',
                px: '5px',
                borderRadius: '12px',
                m: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                <ImgIcon size={2.5} src={discDefIcon(key)} />
                <Typography
                  key={key}
                  sx={{
                    fontWeight: '900',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '135px',
                  }}
                >
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
                {count}
              </SqBadge>
            </Box>
          ))}
        </Stack>
      </Box>
    </ZCard>
  ) : (
    <EmptyCompactCard placeholder={t('noActiveSets')} />
  )
}
