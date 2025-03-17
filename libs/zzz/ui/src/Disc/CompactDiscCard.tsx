import {
  CardThemed,
  ColorText,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscRarityKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
  rarityColor,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { SlotIcon, StatIcon } from '@genshin-optimizer/zzz/svgicons'
import type { ISubstat } from '@genshin-optimizer/zzz/zood'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { Theme } from '@mui/system'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { ZCard } from '../Components'
import { EmptyCompactCard } from '../util'
import { useSpinner } from './util'

export function CompactDiscCard({
  disc,
  slotKey,
  onClick,
}: {
  disc: ICachedDisc
  slotKey: DiscSlotKey
  onClick?: () => void
}) {
  const {
    rotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
  } = useSpinner()

  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea sx={{ borderRadius: 0 }} onClick={onClick}>
        {children}
      </CardActionArea>
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

  return disc ? (
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
              padding: '4px',
            }}
          >
            <CardThemed bgt="light" sx={{ borderRadius: '12px' }}>
              <Box sx={{ padding: '7px' }}>
                <Box
                  sx={(theme: Theme) => ({
                    border: `4px solid ${
                      theme.palette[rarityColor[disc.rarity]].main
                    }`,
                    borderRadius: '50%',
                  })}
                >
                  <Box
                    onMouseDown={(e: React.MouseEvent) =>
                      handleMouseDown(e.nativeEvent)
                    }
                    onMouseMove={(e: React.MouseEvent) =>
                      handleMouseMove(e.nativeEvent)
                    }
                    onMouseUp={(e: React.MouseEvent) =>
                      handleMouseUp(e.nativeEvent)
                    }
                    onMouseLeave={(e: React.MouseEvent) =>
                      handleMouseUp(e.nativeEvent)
                    }
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: '50%',
                      border: `4px solid #1B263B`,
                    }}
                  >
                    <Box
                      component={NextImage ? NextImage : 'img'}
                      alt="Disc Piece Image"
                      src={discDefIcon(disc.setKey)}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                      sx={{
                        width: 'auto',
                        float: 'right',
                        height: '92px',
                        transition: isDragging
                          ? 'none'
                          : 'transform 0.1s ease-out',
                      }}
                    />
                    <Box
                      sx={{
                        height: 0,
                        position: 'absolute',
                        bottom: '66px',
                      }}
                    >
                      <SlotIcon
                        slotKey={disc.slotKey}
                        iconProps={{
                          sx: (theme) => ({
                            border: '1px solid #1B263B',
                            background: '#1B263B',
                            borderRadius: '20px',
                            fontSize: '2.5rem',
                            fill: `${
                              theme.palette[rarityColor[disc.rarity]].main
                            }`,
                          }),
                        }}
                      ></SlotIcon>
                    </Box>
                    <Box sx={{ height: 0, position: 'absolute', bottom: 20 }}>
                      <Typography
                        sx={(theme) => ({
                          backgroundColor: `${theme.palette.contentNormal.main}`,
                          px: '20px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                        })}
                        variant="h6"
                      >
                        {disc.level}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardThemed
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    width: '100%',
                    justifyContent: 'space-around',
                    mt: '12px',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    <StatIcon statKey={disc.mainStatKey}></StatIcon>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {toPercent(
                      getDiscMainStatVal(
                        disc.rarity,
                        disc.mainStatKey,
                        disc.level
                      ),
                      disc.mainStatKey
                    ).toFixed(statKeyToFixed(disc.mainStatKey))}
                    {getUnitStr(disc.mainStatKey)}
                  </Typography>
                </CardThemed>
              </Box>
            </CardThemed>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                ml: '10px',
                mt: '3px',
              }}
            >
              {disc.substats.map(
                (substat) =>
                  substat.key && (
                    <SubstatDisplay
                      key={substat.key}
                      substat={substat}
                      rarity={disc.rarity}
                    />
                  )
              )}
            </Box>
          </Box>
        </ConditionalWrapper>
      </Suspense>
    </ZCard>
  ) : (
    <EmptyCompactCard placeholder={`Disc Slot ${slotKey}`} onClick={onClick} />
  )
}

function SubstatDisplay({
  substat,
  rarity,
}: {
  substat: ISubstat
  rarity: DiscRarityKey
}) {
  const { key, upgrades } = substat
  if (!upgrades || !key) return null
  const displayValue = toPercent(
    getDiscSubStatBaseVal(key, rarity) * upgrades,
    key
  ).toFixed(statKeyToFixed(key))
  return (
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StatIcon statKey={key} />
      </Box>
      <Box sx={{ fontSize: '1rem', display: 'flex', width: '100%' }}>
        <Box sx={{ mr: '3px' }}>
          {displayValue}
          {getUnitStr(key)}
        </Box>
        <Box>
          {upgrades > 1 && (
            <ColorText color="warning">+{upgrades - 1}</ColorText>
          )}
        </Box>
      </Box>
    </Typography>
  )
}
