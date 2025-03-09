import {
  ConditionalWrapper,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { wengineAsset, wenginePhaseIcon } from '@genshin-optimizer/zzz/assets'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import type { ICachedWengine } from '@genshin-optimizer/zzz/db'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { StatDisplay } from '../Character'
import { ZCard } from '../Components'
import { WengineSubstatDisplay } from './WengineSubstatDisplay'

export function CompactWengineCard({
  wengineId,
  onClick,
}: {
  wengineId: string
  onClick?: () => void
}) {
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={() => onClick?.()}>{children}</CardActionArea>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => <Box>{children}</Box>,
    []
  )
  const {
    key,
    level = 0,
    phase = 1,
    modification = 0,
  } = useWengine(wengineId) as ICachedWengine
  const wengineStat = getWengineStat(key)
  const wengineStats = getWengineStats(key, level, phase, modification)

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
        <ZCard bgt="dark" sx={{ padding: '12px' }}>
          <Box component={'div'} sx={{ display: 'flex' }}>
            <Box component={'div'}>
              <Box
                component={NextImage ? NextImage : 'img'}
                alt="Wengine Image"
                src={wengineAsset(key, 'icon')}
                sx={(theme) => ({
                  border: `4px solid ${
                    theme.palette[rarityColor[wengineStat.rarity]].main
                  }`,
                  borderRadius: '12px',
                  background: '#2B364D',
                  width: '145px',
                  height: '145px',
                })}
              />
            </Box>
            <Box component={'div'} sx={{ ml: '24px' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  mb: '16px',
                }}
              >
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '900',
                    fontSize: '1.5rem',
                  }}
                >
                  <StatDisplay statKey={'atk'} showStatName={false} />
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: '900' }}>
                  {wengineStats['atk_base'].toFixed()}
                </Typography>
              </Box>
              <WengineSubstatDisplay
                substatKey={wengineStat['second_statkey']}
                substatValue={wengineStats[wengineStat['second_statkey']]}
                showStatName={false}
                styleProps={{ fontSize: '1.2rem' }}
              />
            </Box>
          </Box>
          <Box
            component={'div'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: '#2B364D',
              borderRadius: '20px',
              justifyContent: 'space-between',
              mt: '8px',
            }}
          >
            <Typography
              sx={{
                fontWeight: '900',
                ml: '16px',
              }}
              variant="subtitle1"
            >
              Lv.{level}
            </Typography>
            <Box
              component={'div'}
              sx={{
                display: 'flex',
                width: '5em',
                padding: '4px 0',
                mr: '42px',
              }}
            >
              {range(1, 5).map((index: number) => {
                return index <= phase ? (
                  <ImgIcon
                    src={wenginePhaseIcon('singlePhase')}
                    sx={{ width: '5em', height: '1.5em' }}
                  />
                ) : (
                  <ImgIcon
                    src={wenginePhaseIcon('singleNonPhase')}
                    sx={{ width: '5em', height: '1.5em' }}
                  />
                )
              })}
            </Box>
          </Box>
        </ZCard>
      </ConditionalWrapper>
    </Suspense>
  )
}
