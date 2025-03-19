import {
  BootstrapTooltip,
  ColorText,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { clamp, getUnitStr } from '@genshin-optimizer/common/util'
import { artifactAsset, imgAssets } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedSubstat } from '@genshin-optimizer/gi/db'
import { useArtifact, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  artDisplayValue,
  getMainStatDisplayStr,
} from '@genshin-optimizer/gi/util'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import {
  Box,
  CardActionArea,
  Chip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { StatColoredWithUnit } from '../StatDisplay'
import { CharIconSide } from '../character'
import { ArtifactTooltip } from './ArtifactTooltip'
import { artifactLevelVariant } from './util'

type Data = {
  artifactId?: string
  slotKey: ArtifactSlotKey
  mainStatAssumptionLevel?: number
  onClick?: () => void
  showLocation?: boolean
}

export function ArtifactCardNano({
  artifactId,
  slotKey: pSlotKey,
  mainStatAssumptionLevel = 0,
  showLocation = false,
  onClick,
}: Data) {
  const art = useArtifact(artifactId)
  const database = useDatabase()
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  const theme = useTheme()
  if (!art)
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Box
          component={NextImage ? NextImage : 'img'}
          src={imgAssets.slot[pSlotKey]}
          sx={{ width: '25%', height: 'auto', opacity: 0.7 }}
        />
      </Box>
    )

  const { slotKey, rarity, level, mainStatKey, substats, location } = art
  const mainStatLevel = Math.max(
    Math.min(mainStatAssumptionLevel, rarity * 4),
    level
  )
  const element = allElementWithPhyKeys.find((ele) =>
    art.mainStatKey.includes(ele)
  )
  const color = element
    ? alpha(theme.palette[element].main, 0.6)
    : alpha(theme.palette.secondary.main, 0.6)
  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <Box display="flex" height="100%">
        <Box
          className={`grad-${rarity}star`}
          sx={{
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArtifactTooltip art={art}>
            <Box
              component={NextImage ? NextImage : 'img'}
              src={artifactAsset(art.setKey, slotKey)}
              sx={{ m: -1, maxHeight: '110%', maxWidth: '110%' }}
            />
          </ArtifactTooltip>
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              p: 0.5,
              opacity: 0.85,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <Chip
              size="small"
              label={<strong>{` +${level}`}</strong>}
              color={artifactLevelVariant(level)}
            />
            {showLocation && (
              <Chip
                size="small"
                label={
                  location ? (
                    <CharIconSide
                      characterKey={database.chars.LocationToCharacterKey(
                        location
                      )}
                    />
                  ) : (
                    <BusinessCenterIcon />
                  )
                }
                color={'secondary'}
                sx={{
                  overflow: 'visible',
                  '.MuiChip-label': {
                    overflow: 'visible',
                  },
                }}
              />
            )}
          </Box>
          {/* mainstats */}
          <Chip
            size="small"
            sx={{
              position: 'absolute',
              bottom: 0,
              mb: 1,
              backgroundColor: color,
              p: 1,
            }}
            icon={
              <BootstrapTooltip
                placement="top"
                title={
                  <Typography>
                    <StatColoredWithUnit statKey={mainStatKey} />
                  </Typography>
                }
                disableInteractive
              >
                <Box lineHeight={0}>
                  <StatIcon
                    statKey={mainStatKey}
                    iconProps={{ style: { padding: '4px' } }}
                  />
                </Box>
              </BootstrapTooltip>
            }
            label={
              <Typography sx={{ mx: -0.7 }}>
                <ColorText
                  color={mainStatLevel !== level ? 'warning' : undefined}
                >
                  {getMainStatDisplayStr(mainStatKey, rarity, mainStatLevel)}
                </ColorText>
              </Typography>
            }
          />
        </Box>
        {/* substats */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          sx={{ p: 1 }}
        >
          {substats.map((stat: ICachedSubstat) => (
            <SubstatDisplay key={stat.key} stat={stat} />
          ))}
        </Box>
      </Box>
    </ConditionalWrapper>
  )
}
function SubstatDisplay({ stat }: { stat: ICachedSubstat }) {
  if (!stat.value) return null
  const numRolls = stat.rolls?.length ?? 0
  const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const statUnit = getUnitStr(stat.key)
  return (
    <Box display="flex" gap={1} alignContent="center">
      <Typography
        sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}
        color={(numRolls ? `${rollColor}.main` : 'error.main') as any}
        component="span"
      >
        <BootstrapTooltip
          placement="top"
          title={
            <Typography>
              {stat.key && <StatColoredWithUnit statKey={stat.key} />}
            </Typography>
          }
          disableInteractive
        >
          <Box lineHeight={0}>
            <StatIcon statKey={stat.key} iconProps={{ fontSize: 'inherit' }} />
          </Box>
        </BootstrapTooltip>
        <span>{`${artDisplayValue(stat.value, statUnit)}${statUnit}`}</span>
      </Typography>
    </Box>
  )
}
