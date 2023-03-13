import { allElementWithPhyKeys } from '@genshin-optimizer/consts'
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
import SlotIcon from '../../../../../Components/Artifact/SlotIcon'
import BootstrapTooltip from '../../../../../Components/BootstrapTooltip'
import SqBadge from '../../../../../Components/SqBadge'
import { StatColoredWithUnit } from '../../../../../Components/StatDisplay'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import Artifact from '../../../../../Data/Artifacts/Artifact'
import { DatabaseContext } from '../../../../../Database/Database'
import StatIcon from '../../../../../KeyMap/StatIcon'
import { iconInlineProps } from '../../../../../SVGIcons'
import FlowerIcon from '../../../../../SVGIcons/ArtifactSlot/FlowerIcon'
import PlumeIcon from '../../../../../SVGIcons/ArtifactSlot/PlumeIcon'
import AtkIcon from '../../../../../SVGIcons/Stats/AtkIcon'
import HpIcon from '../../../../../SVGIcons/Stats/HpIcon'
import { handleMultiSelect } from '../../../../../Util/MultiSelect'
import { bulkCatTotal } from '../../../../../Util/totalUtils'
import useBuildSetting from '../useBuildSetting'

export const artifactsSlotsToSelectMainStats = [
  'sands',
  'goblet',
  'circlet',
] as const

export default function MainStatSelectionCard({
  disabled = false,
  filteredArtIdMap,
}: {
  disabled?: boolean
  filteredArtIdMap: Record<string, boolean>
}) {
  const { t } = useTranslation('artifact')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { mainStatKeys },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const { mainStatSlotTots, slotTots } = useMemo(() => {
    const catKeys = {
      flowerMainStatTots: Artifact.slotMainStats('flower'),
      plumeMainStatTots: Artifact.slotMainStats('plume'),
      sandsMainStatTots: Artifact.slotMainStats('sands'),
      gobletMainStatTots: Artifact.slotMainStats('goblet'),
      circletMainStatTots: Artifact.slotMainStats('circlet'),
      slotTots: artifactsSlotsToSelectMainStats,
    } as const
    const catTotals = bulkCatTotal(catKeys, (ctMap) =>
      Object.entries(database.arts.data).forEach(([id, art]) => {
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
              title={<Typography>{t(`slotName.flower`)}</Typography>}
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
              title={<Typography>{t(`slotName.plume`)}</Typography>}
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
        const mainKeys = Artifact.slotMainStats(slotKey)
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
                            buildSettingDispatch({
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
