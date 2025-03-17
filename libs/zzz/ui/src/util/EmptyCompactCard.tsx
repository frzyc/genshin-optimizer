import { ConditionalWrapper } from '@genshin-optimizer/common/ui'
import { Box, CardActionArea, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { ZCard } from '../Components'
export const COMPACT_CARD_HEIGHT_PX = 165
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
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => <Box>{children}</Box>,
    []
  )

  return (
    <ZCard bgt="dark">
      <ConditionalWrapper
        condition={!!onClick}
        wrapper={wrapperFunc}
        falseWrapper={falseWrapperFunc}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${COMPACT_CARD_HEIGHT_PX}px`,
          }}
        >
          <Typography
            variant="h5"
            sx={(theme) => ({
              textTransform: 'uppercase',
              color: `${theme.palette.contentZzz.main}`,
              fontWeight: '900',
            })}
          >
            {placeholder}
          </Typography>
        </Box>
      </ConditionalWrapper>
    </ZCard>
  )
}
