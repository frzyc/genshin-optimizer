import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { BootstrapTooltip, SqBadge } from '@genshin-optimizer/common/ui'
import { bulkCatTotal, handleMultiSelect } from '@genshin-optimizer/common/util'
import {
  allElementWithPhyKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import {
  AtkIcon,
  FlowerIcon,
  HpIcon,
  PlumeIcon,
  SlotIcon,
  StatIcon,
} from '@genshin-optimizer/gi/svgicons'
import { StatColoredWithUnit } from '@genshin-optimizer/gi/ui'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const artifactsSlotsToSelectMainStats = ['sands', 'goblet', 'circlet'] as const

export default function MainStatSelectionCard({
  disabled = false,
  filteredArtIdMap,
}: {
  disabled?: boolean
  filteredArtIdMap: Record<string, boolean>
}) {
  const { t } = useTranslation('artifact')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { mainStatKeys } = useOptConfig(optConfigId)!
  const database = useDatabase()
  const { mainStatSlotTots, slotTots } = useMemo(() => {
    const catKeys = {
      flowerMainStatTots: artSlotMainKeys['flower'],
      plumeMainStatTots: artSlotMainKeys['plume'],
      sandsMainStatTots: artSlotMainKeys['sands'],
      gobletMainStatTots: artSlotMainKeys['goblet'],
      circletMainStatTots: artSlotMainKeys['circlet'],
      slotTots: artifactsSlotsToSelectMainStats,
    } as const
    const catTotals = bulkCatTotal(catKeys, (ctMap) =>
      database.arts.entries.forEach(([id, art]) => {
        const { slotKey, mainStatKey } = art
        if (
          (artifactsSlotsToSelectMainStats as readonly string[]).includes(
            slotKey
          )
        ) {
          ctMap.slotTots[slotKey].total++
          if (filteredArtIdMap[id]) ctMap.slotTots[slotKey].current++
        }
        ctMap[`${slotKey}MainStatTots`][mainStatKey].total++
        if (filteredArtIdMap[id])
          ctMap[`${slotKey}MainStatTots`][mainStatKey].current++
      })
    )
    return {
      mainStatSlotTots: {
        flower: catTotals.flowerMainStatTots,
        plume: catTotals.plumeMainStatTots,
        sands: catTotals.sandsMainStatTots,
        goblet: catTotals.gobletMainStatTots,
        circlet: catTotals.circletMainStatTots,
      },
      slotTots: catTotals.slotTots,
    }
  }, [database, filteredArtIdMap])

  return (
    <Box display="flex" flexDirection="column">
      <Divider />
      <Box display="flex">
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <BootstrapTooltip
              placement="top"
              title={<Typography>{t('slotName.flower')}</Typography>}
            >
              <FlowerIcon fontSize="inherit" />
            </BootstrapTooltip>
            <Box flexGrow={1}>
              <SqBadge color="info">
                <HpIcon {...iconInlineProps} /> {mainStatSlotTots.flower.hp}
              </SqBadge>
            </Box>
          </Box>
        </CardContent>
        <Divider orientation="vertical" flexItem />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <BootstrapTooltip
              placement="top"
              title={<Typography>{t('slotName.plume')}</Typography>}
            >
              <PlumeIcon fontSize="inherit" />
            </BootstrapTooltip>
            <Box flexGrow={1}>
              <SqBadge color="info">
                <AtkIcon {...iconInlineProps} /> {mainStatSlotTots.plume.atk}
              </SqBadge>
            </Box>
          </Box>
        </CardContent>
      </Box>
      {artifactsSlotsToSelectMainStats.map((slotKey) => {
        const selectedMainKeys = mainStatKeys[slotKey]
        const mainKeys = artSlotMainKeys[slotKey]
        const mainKeysHandler = handleMultiSelect([...mainKeys])
        return (
          <Box key={slotKey}>
            <Divider />
            <CardContent sx={{ pt: 1, pb: 1 }}>
              <Box
                sx={{ display: 'flex', gap: 1, alignItems: 'center', pb: 1 }}
              >
                <BootstrapTooltip
                  placement="top"
                  title={<Typography>{t(`slotName.${slotKey}`)}</Typography>}
                >
                  <Box lineHeight={0}>
                    <SlotIcon
                      slotKey={slotKey}
                      iconProps={{ fontSize: 'inherit' }}
                    />
                  </Box>
                </BootstrapTooltip>
                <Box flexGrow={1}>
                  <SqBadge color="info">{slotTots[slotKey]}</SqBadge>
                </Box>
              </Box>
              <Grid container spacing={1}>
                {mainKeys.map((mainStatKey, i) => {
                  const element = allElementWithPhyKeys.find((ele) =>
                    mainStatKey.includes(ele)
                  )
                  const color = selectedMainKeys.includes(mainStatKey)
                    ? element ?? 'success'
                    : 'secondary'
                  return (
                    <Grid
                      item
                      key={mainStatKey}
                      flexGrow={1}
                      xs={
                        (i < 3 && slotKey !== 'goblet') || slotKey === 'goblet'
                          ? 4
                          : undefined
                      }
                    >
                      <BootstrapTooltip
                        placement="top"
                        title={
                          <Typography>
                            <strong>
                              <StatColoredWithUnit statKey={mainStatKey} />
                            </strong>
                          </Typography>
                        }
                        disableInteractive
                      >
                        <Button
                          fullWidth
                          size="small"
                          color={color}
                          sx={{
                            height: '100%',
                            pointerEvents: disabled ? 'none' : undefined,
                            cursor: disabled ? 'none' : undefined,
                          }}
                          startIcon={<StatIcon statKey={mainStatKey} />}
                          onClick={() =>
                            database.optConfigs.set(optConfigId, {
                              mainStatKeys: {
                                ...mainStatKeys,
                                [slotKey]: mainKeysHandler(
                                  selectedMainKeys,
                                  mainStatKey
                                ),
                              },
                            })
                          }
                        >
                          {mainStatSlotTots[slotKey][mainStatKey]}
                        </Button>
                      </BootstrapTooltip>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
          </Box>
        )
      })}
    </Box>
  )
}
