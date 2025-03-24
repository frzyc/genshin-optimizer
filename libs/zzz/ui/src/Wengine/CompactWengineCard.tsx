import {
  CardThemed,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  range,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { wengineAsset, wenginePhaseIcon } from '@genshin-optimizer/zzz/assets'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext } from 'react'
import { ZCard } from '../Components'
import { StatHighlightContext, getHighlightRGBA, isHighlight } from '../context'
import { COMPACT_CARD_HEIGHT_PX, EmptyCompactCard } from '../util'

export function CompactWengineCard({
  wengineId,
  onClick,
}: {
  wengineId: string | undefined
  onClick?: () => void
}) {
  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
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
  const substatKey = wengineStat['second_statkey']

  return (
    <ZCard bgt="dark">
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              height: `${COMPACT_CARD_HEIGHT_PX}px`,
            }}
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
              p: 0.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: `${COMPACT_CARD_HEIGHT_PX}px`,
              gap: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              <Box
                component={NextImage ? NextImage : 'img'}
                alt="Wengine Image"
                src={wengineAsset(wengine.key, 'icon')}
                sx={(theme) => ({
                  border: `${theme.spacing(0.5)} solid ${
                    theme.palette[rarityColor[wengineStat.rarity]].main
                  }`,
                  borderRadius: '12px',
                  background: theme.palette.contentLight.main,
                  width: `${COMPACT_CARD_HEIGHT_PX - 40}px`,
                  height: `${COMPACT_CARD_HEIGHT_PX - 40}px`,
                })}
              />

              <Box
                sx={{
                  ml: '10px',
                  py: 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography
                  onMouseEnter={() => setStatHighlight('atk')}
                  onMouseLeave={() => setStatHighlight('')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    gap: 1,
                    position: 'relative',
                    overflow: 'visible',
                    '::after': {
                      content: '""',
                      position: 'absolute',
                      left: '-5%',
                      width: '110%',
                      height: '150%',
                      borderRadius: 0.5,
                      backgroundColor: getHighlightRGBA(
                        isHighlight(statHighlight, 'atk')
                      ),
                      transition: 'background-color 0.3s ease-in-out',
                    },
                  }}
                >
                  <StatIcon statKey={'atk'} />
                  <span>{wengineStats['atk_base'].toFixed()}</span>
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    gap: 1,
                    position: 'relative',
                    '::after': {
                      content: '""',
                      position: 'absolute',
                      left: '-5%',
                      width: '110%',
                      height: '150%',
                      borderRadius: 0.5,
                      backgroundColor: getHighlightRGBA(
                        isHighlight(statHighlight, substatKey)
                      ),
                      transition: 'background-color 0.3s ease-in-out',
                    },
                  }}
                >
                  <StatIcon statKey={substatKey} />
                  <span>
                    {toPercent(wengineStats[substatKey], substatKey).toFixed(
                      statKeyToFixed(substatKey)
                    )}
                    {getUnitStr(substatKey)}
                  </span>
                </Typography>
              </Box>
            </Box>
            <CardThemed
              bgt="light"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: '900',
                }}
                variant="subtitle1"
              >
                Lv.{wengine.level}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {range(1, 5).map((index: number) => (
                  <Box
                    component={NextImage ? (NextImage as any) : 'img'}
                    key={`phase-active-${index}`}
                    src={wenginePhaseIcon(
                      index <= wengine.phase ? 'singlePhase' : 'singleNonPhase'
                    )}
                  />
                ))}
              </Box>
            </CardThemed>
          </Box>
        </ConditionalWrapper>
      </Suspense>
    </ZCard>
  )
}
