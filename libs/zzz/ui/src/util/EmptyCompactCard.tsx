import { ConditionalWrapper } from '@genshin-optimizer/common/ui'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { ZCard } from '../Components'

export function EmptyCompactCard({
  placeholder,
  onClick,
}: {
  placeholder: string
  onClick?: () => void
}) {
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea sx={{ borderRadius: 0 }} onClick={onClick}>
        {children}
      </CardActionArea>
    ),
    [onClick],
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    ),
    [],
  )

  return (
    <ZCard bgt="dark">
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: '16px',
              justifyContent: 'center',
              height: '212px',
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
              {placeholder}
            </Typography>
          </Box>
        </ConditionalWrapper>
      </Suspense>
    </ZCard>
  )
}
