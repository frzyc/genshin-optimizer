import {
  ConditionalWrapper,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { wengineAsset, wenginePhaseIcon } from '@genshin-optimizer/zzz/assets'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { ZCard } from '../Components'
import { EmptyCompactCard } from '../util'
import { WengineSubstatDisplay } from './WengineSubstatDisplay'

export function CompactWengineCard({
  wengineId,
  onClick,
}: {
  wengineId: string | undefined
  onClick?: () => void
}) {
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea sx={{ borderRadius: 0 }} onClick={() => onClick?.()}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => <Box>{children}</Box>,
    []
  )
  const wengine = useWengine(wengineId)
  if (!wengine) {
    return (
      <EmptyCompactCard placeholder={'No Wengine Equipped'} onClick={onClick} />
    )
  }
  const wengineStat = getWengineStat(wengine.key)
  const wengineStats = getWengineStats(
    wengine.key,
    wengine.level,
    wengine.phase,
    wengine.modification
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
          <Box sx={{ p: '4px' }}>
            <Box sx={{ display: 'flex' }}>
              <Box
                component={NextImage ? NextImage : 'img'}
                alt="Wengine Image"
                src={wengineAsset(wengine.key, 'icon')}
                sx={(theme) => ({
                  border: `4px solid ${
                    theme.palette[rarityColor[wengineStat.rarity]].main
                  }`,
                  borderRadius: '12px',
                  background: '#2B364D',
                  width: '130px',
                  height: '130px',
                })}
              />

              <Box sx={{ ml: '10px' }}>
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
                    }}
                  >
                    <StatIcon statKey={'atk'} />
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
                Lv.{wengine.level}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  width: '5em',
                  padding: '4px 0',
                  mr: '42px',
                }}
              >
                {range(1, 5).map((index: number) => {
                  return index <= wengine.phase ? (
                    <ImgIcon
                      key={`phase-active-${index}`}
                      src={wenginePhaseIcon('singlePhase')}
                      sx={{ width: '5em', height: '1.5em' }}
                    />
                  ) : (
                    <ImgIcon
                      key={`phase-inactive-${index}`}
                      src={wenginePhaseIcon('singleNonPhase')}
                      sx={{ width: '5em', height: '1.5em' }}
                    />
                  )
                })}
              </Box>
            </Box>
          </Box>
        </ConditionalWrapper>
      </Suspense>
    </ZCard>
  )
}
