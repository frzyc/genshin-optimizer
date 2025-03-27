import {
  CardThemed,
  ColorText,
  ConditionalWrapper,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { characterAsset, discDefIcon } from '@genshin-optimizer/zzz/assets'
import type {
  CharacterKey,
  DiscRarityKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
  rarityColor,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { SlotIcon, StatIcon } from '@genshin-optimizer/zzz/svgicons'
import type { ISubstat } from '@genshin-optimizer/zzz/zood'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { Theme } from '@mui/system'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext } from 'react'
import { ZCard } from '../Components'
import { StatHighlightContext, getHighlightRGBA, isHighlight } from '../context'
import { COMPACT_CARD_HEIGHT_PX, EmptyCompactCard } from '../util'
import { useSpinner } from './util'

export function CompactDiscCard({
  disc,
  slotKey,
  onClick,
}: {
  disc?: ICachedDisc
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

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const isHL = disc?.mainStatKey
    ? isHighlight(statHighlight, disc?.mainStatKey)
    : false
  const location = disc?.location

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

  return disc ? (
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
              display: 'flex',
              padding: 0.5,
              height: `${COMPACT_CARD_HEIGHT_PX}px`,
            }}
          >
            <CardThemed bgt="light" sx={{ borderRadius: '12px' }}>
              <Box
                sx={{
                  padding: 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    height: 0,
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    zIndex: 100,
                  }}
                >
                  {location ? (
                    <ImgIcon
                      src={characterAsset(location as CharacterKey, 'circle')}
                      sx={(theme: Theme) => ({
                        border: `4px solid ${
                          theme.palette[rarityColor[disc.rarity]].main
                        }`,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                      })}
                    />
                  ) : (
                    <Box
                      sx={(theme: Theme) => ({
                        border: `4px solid ${
                          theme.palette[rarityColor[disc.rarity]].main
                        }`,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        background: theme.palette['contentNormal'].main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: '1px',
                      })}
                    >
                      <BusinessCenterIcon fontSize={'small'} />
                    </Box>
                  )}
                </Box>
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
                      />
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
                    padding: '4px 8px',
                    width: '100%',
                  }}
                >
                  <Typography
                    onMouseEnter={() => setStatHighlight(disc.mainStatKey)}
                    onMouseLeave={() => setStatHighlight('')}
                    variant="subtitle1"
                    noWrap
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      justifyContent: 'center',
                      gap: 1,
                      position: 'relative',
                      overflow: 'visible',
                      '::after': {
                        content: '""',
                        position: 'absolute',
                        py: 0.5,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0.5,
                        backgroundColor: getHighlightRGBA(isHL),
                        transition: 'background-color 0.3s ease-in-out',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <StatIcon statKey={disc.mainStatKey}></StatIcon>
                    <span>
                      {toPercent(
                        getDiscMainStatVal(
                          disc.rarity,
                          disc.mainStatKey,
                          disc.level
                        ),
                        disc.mainStatKey
                      ).toFixed(statKeyToFixed(disc.mainStatKey))}
                      {getUnitStr(disc.mainStatKey)}
                    </span>
                  </Typography>
                </CardThemed>
              </Box>
            </CardThemed>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                pl: '10px',
                flexGrow: 1,
                py: 0.5,
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
  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const isHL = isHighlight(statHighlight, key)
  if (!upgrades || !key) return null
  const displayValue = toPercent(
    getDiscSubStatBaseVal(key, rarity) * upgrades,
    key
  ).toFixed(statKeyToFixed(key))
  return (
    <Typography
      onMouseEnter={() => setStatHighlight(key)}
      onMouseLeave={() => setStatHighlight('')}
      variant="subtitle1"
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
          width: '105%',
          height: '130%',
          borderRadius: 0.5,
          backgroundColor: getHighlightRGBA(isHL),
          transition: 'background-color 0.3s ease-in-out',
        },
      }}
    >
      <StatIcon statKey={key} />
      <Box>
        {displayValue}
        {getUnitStr(key)}
        {upgrades > 1 && (
          <ColorText color="warning"> +{upgrades - 1}</ColorText>
        )}
      </Box>
    </Typography>
  )
}
