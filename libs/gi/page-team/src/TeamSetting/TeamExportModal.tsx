import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { toggleInArr } from '@genshin-optimizer/common/util'
import {
  defLoadoutExportSetting,
  type LoadoutDataExportSetting,
  type LoadoutDatum,
  type LoadoutExportSetting,
} from '@genshin-optimizer/gi/db'
import {
  useDatabase,
  useOptConfig,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  BuildIcon,
  CharIconSide,
  CustomMultiTargetIcon,
  DataContext,
  FieldDisplayList,
  OptimizationIcon,
  OptimizationTargetDisplay,
  useCharData,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'

// TODO: Translation
export default function TeamExportModal({
  show,
  onHide,
  teamId,
}: {
  show: boolean
  onHide: () => void
  teamId: string
}) {
  const database = useDatabase()
  const team = useTeam(teamId)!
  const { loadoutData } = team

  // If a mtarget is selected as opt-target, enforce it must be selected
  const enforceOptTargetMtarget = (
    loadoutDatum: LoadoutDatum,
    setting: LoadoutExportSetting
  ) => {
    const teamChar = database.teamChars.get(loadoutDatum.teamCharId)!
    const optConfig = database.optConfigs.get(teamChar.optConfigId)!
    const { optimizationTarget } = optConfig
    if (!optimizationTarget) return setting
    if (optimizationTarget[0] !== 'custom') return setting
    const ind = parseInt(optimizationTarget[1])
    if (isNaN(ind)) return setting
    if (setting.exportCustomMultiTarget.includes(ind)) return setting
    setting.exportCustomMultiTarget.push(ind)
    return setting
  }

  const [loadoutDataExportSetting, setLoadoutDataExportSetting] =
    useState<LoadoutDataExportSetting>(() =>
      loadoutData.map((loadoutDatum) =>
        loadoutDatum
          ? enforceOptTargetMtarget(loadoutDatum, defLoadoutExportSetting())
          : defLoadoutExportSetting()
      )
    )
  const onExport = () => {
    const data = database.teams.export(teamId, loadoutDataExportSetting)
    const dataStr = JSON.stringify(data)
    navigator.clipboard
      .writeText(dataStr)
      .then(() => alert('Copied team data to clipboard.'))
      .catch(console.error)
  }
  const [selAll, setSelAll] = useState(true)

  const onUnselAll = () => {
    setSelAll(true)
    setLoadoutDataExportSetting(
      loadoutData.map((loadoutDatum) =>
        loadoutDatum
          ? enforceOptTargetMtarget(loadoutDatum, defLoadoutExportSetting())
          : defLoadoutExportSetting()
      )
    )
  }

  const onSelAll = () => {
    setSelAll(false)
    setLoadoutDataExportSetting(
      loadoutData.map((loadoutDatum) => {
        if (!loadoutDatum) return defLoadoutExportSetting()

        const loadout = database.teamChars.get(loadoutDatum.teamCharId)
        if (!loadout) return defLoadoutExportSetting()
        const { buildIds, buildTcIds, customMultiTargets } = loadout
        return enforceOptTargetMtarget(loadoutDatum, {
          convertEquipped: true,
          convertbuilds: buildIds,
          convertTcBuilds: buildTcIds,
          exportCustomMultiTarget: customMultiTargets?.map((_, i) => i) ?? [],
        })
      })
    )
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardHeader
          title="Team Export"
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Alert severity="info">
              Export the team data to be imported by another user. All the team
              and loadout data (bonus stats, enemy config, optimize config) are
              exported. All exported non-TC builds are converted to TC builds.
            </Alert>
            <Button color="info" onClick={selAll ? onSelAll : onUnselAll}>
              {selAll ? 'Select All' : 'Unselect All'}
            </Button>
          </Box>

          <Grid container columns={{ xs: 1, sm: 2, md: 4 }} spacing={1}>
            {loadoutData.map(
              (loadout, i) =>
                !!loadout && (
                  <Grid item xs={1} key={i}>
                    <LoadoutSetting
                      loadout={loadout}
                      setting={loadoutDataExportSetting[i]}
                      setSetting={(loadoutExportSetting) =>
                        setLoadoutDataExportSetting((settings) => {
                          const data = structuredClone(settings)
                          data[i] = {
                            ...data[i],
                            ...loadoutExportSetting,
                          }
                          return data
                        })
                      }
                    />
                  </Grid>
                )
            )}
          </Grid>
        </CardContent>
        <Divider />
        <CardContent
          sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}
        >
          <Button color="success" onClick={onExport}>
            Export
          </Button>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function LoadoutSetting({
  loadout,
  setting,
  setSetting,
}: {
  loadout: LoadoutDatum
  setting: LoadoutExportSetting
  setSetting: (loadoutExportSetting: Partial<LoadoutExportSetting>) => void
}) {
  const database = useDatabase()
  const teamChar = useTeamChar(loadout.teamCharId)!
  const {
    key: characterKey,
    name,
    description,
    buildIds,
    buildTcIds,
    customMultiTargets,
  } = teamChar
  const optConfig = useOptConfig(teamChar.optConfigId)!
  const { optimizationTarget } = optConfig

  const selMtargetInd =
    optimizationTarget && optimizationTarget[0] === 'custom'
      ? parseInt(optimizationTarget[1])
      : -1

  // FIXME: Kind of annoying to have to do a whole calc to show opt target, will likely get addressed in Pando.

  const teamData = useCharData(characterKey)
  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])

  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CharIconSide characterKey={characterKey} />
        <Typography>{name}</Typography>
        {!!description && (
          <BootstrapTooltip title={description}>
            <InfoIcon />
          </BootstrapTooltip>
        )}
      </CardContent>
      <Divider />
      {dataContextValue && (
        <DataContext.Provider value={dataContextValue}>
          {optimizationTarget && (
            <>
              <CardContent>
                <Typography
                  sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <OptimizationIcon />
                  <Box>Optimization Target:</Box>
                </Typography>
                <Typography>
                  <OptimizationTargetDisplay
                    customMultiTargets={customMultiTargets}
                    optimizationTarget={optimizationTarget}
                  />
                </Typography>
              </CardContent>
              <Divider />
            </>
          )}
        </DataContext.Provider>
      )}

      {!!customMultiTargets.length && (
        <>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomMultiTargetIcon />
            <Typography>
              <strong>Mtargets to Export</strong>
            </Typography>
          </CardContent>
          <FieldDisplayList bgt="light">
            {customMultiTargets.map((mtarget, i) => {
              const { name, description } = mtarget
              return (
                <ListItem
                  key={i}
                  sx={{
                    p: 0,
                    border: selMtargetInd === i ? '2px solid green' : undefined,
                  }}
                >
                  <ListItemButton
                    disabled={selMtargetInd === i}
                    onClick={() =>
                      setSetting({
                        exportCustomMultiTarget: toggleInArr(
                          setting.exportCustomMultiTarget,
                          i
                        ),
                      })
                    }
                  >
                    <Checkbox
                      edge="start"
                      checked={setting.exportCustomMultiTarget.includes(i)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={name} />
                    {!!description && (
                      <BootstrapTooltip title={description}>
                        <InfoIcon />
                      </BootstrapTooltip>
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </FieldDisplayList>
          <Divider />
        </>
      )}
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BuildIcon />
        <Typography>
          <strong>Builds to Export</strong>
        </Typography>
      </CardContent>
      <FieldDisplayList bgt="light">
        <ListItem sx={{ p: 0 }}>
          <ListItemButton
            onClick={() =>
              setSetting({ convertEquipped: !setting.convertEquipped })
            }
          >
            <Checkbox
              edge="start"
              checked={setting.convertEquipped}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={`Equipped Build`} />
          </ListItemButton>
        </ListItem>
        {buildIds.map((buildId) => {
          const build = database.builds.get(buildId)!
          return (
            <ListItem key={buildId} sx={{ p: 0 }}>
              <ListItemButton
                onClick={() =>
                  setSetting({
                    convertbuilds: toggleInArr(setting.convertbuilds, buildId),
                  })
                }
              >
                <Checkbox
                  edge="start"
                  checked={setting.convertbuilds.includes(buildId)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={build.name} />
                {!!build.description && (
                  <BootstrapTooltip title={build.description}>
                    <InfoIcon />
                  </BootstrapTooltip>
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
        {buildTcIds.map((buildTcId) => {
          const buildTc = database.buildTcs.get(buildTcId)!
          return (
            <ListItem key={buildTcId} sx={{ p: 0 }}>
              <ListItemButton
                onClick={() =>
                  setSetting({
                    convertTcBuilds: toggleInArr(
                      setting.convertTcBuilds,
                      buildTcId
                    ),
                  })
                }
              >
                <Checkbox
                  edge="start"
                  checked={setting.convertTcBuilds.includes(buildTcId)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={
                    <Box>
                      {buildTc.name} <SqBadge>TC Build</SqBadge>
                    </Box>
                  }
                />
                {!!buildTc.description && (
                  <BootstrapTooltip title={buildTc.description}>
                    <InfoIcon />
                  </BootstrapTooltip>
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </FieldDisplayList>
    </CardThemed>
  )
}
