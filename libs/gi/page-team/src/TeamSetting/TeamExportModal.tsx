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
import { useDatabase, useTeam, useTeamChar } from '@genshin-optimizer/gi/db-ui'
import {
  BuildIcon,
  CharIconSide,
  CustomMultiTargetIcon,
  FieldDisplayList,
} from '@genshin-optimizer/gi/ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
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
} from '@mui/material'
import { useState } from 'react'

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

  const [loadoutDataExportSetting, setLoadoutDataExportSetting] =
    useState<LoadoutDataExportSetting>(() =>
      loadoutData.map(() => defLoadoutExportSetting())
    )
  const onExport = () => {
    const data = database.teams.export(teamId, loadoutDataExportSetting)
    const dataStr = JSON.stringify(data)
    navigator.clipboard
      .writeText(dataStr)
      .then(() => alert('Copied team data to clipboard.'))
      .catch(console.error)
  }
  const [selEverything, setSelEverything] = useState(true)
  const unselectEverything = () => {
    setSelEverything(true)
    setLoadoutDataExportSetting(
      loadoutData.map(() => defLoadoutExportSetting())
    )
  }

  const selectEverything = () => {
    setSelEverything(false)
    setLoadoutDataExportSetting(
      loadoutData.map((loadoutDatum) => {
        if (!loadoutDatum) return defLoadoutExportSetting()

        const loadout = database.teamChars.get(loadoutDatum.teamCharId)
        if (!loadout) return defLoadoutExportSetting()
        const { buildIds, buildTcIds, customMultiTargets } = loadout
        return {
          convertEquipped: true,
          convertbuilds: buildIds,
          convertTcBuilds: buildTcIds,
          exportCustomMultiTarget: customMultiTargets?.map((_, i) => i) ?? [],
        }
      })
    )
  }

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Alert severity="info">
              Export the team data to be imported by another user. All the team
              and loadout data (bonus stats, enemy config, optimize config) are
              exported. All exported non-TC builds are converted to TC builds.
            </Alert>
            <Button
              color="info"
              onClick={selEverything ? selectEverything : unselectEverything}
              startIcon={
                selEverything ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
              }
            >
              {selEverything ? 'Select Everything' : 'Unselect Everything'}
            </Button>
          </Box>

          <Grid container columns={{ xs: 2, md: 4 }} spacing={1}>
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
                <ListItem key={i} sx={{ p: 0 }}>
                  <ListItemButton
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
