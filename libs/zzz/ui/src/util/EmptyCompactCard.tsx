import { ConditionalWrapper } from '@genshin-optimizer/common/ui'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { ZCard } from '../Components'

export function EmptyCompactCard({
  placeholder,
  slotKey,
  onClick,
}: {
  placeholder: string
  slotKey?: string
  onClick?: () => void
}) {
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick}>{children}</CardActionArea>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    ),
    []
  )

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      <ConditionalWrapper
        condition={!!onClick}
        wrapper={wrapperFunc}
        falseWrapper={falseWrapperFunc}
      >
        <ZCard
          bgt="dark"
          sx={{
            display: 'flex',
            py: slotKey ? '86px' : '72px',
            px: slotKey ? '0' : '16px',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={(theme) => ({
              textTransform: 'uppercase',
              color: `${theme.palette.contentZzz.main}`,
              fontWeight: '900',
              textAlign: 'center',
            })}
          >
            {placeholder} {slotKey}
          </Typography>
        </ZCard>
      </ConditionalWrapper>
    </Suspense>
  )
}
