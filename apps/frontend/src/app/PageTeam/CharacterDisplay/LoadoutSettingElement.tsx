import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import type { ButtonProps } from '@mui/material'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useState } from 'react'
import BuildInfoAlert from '../../Components/Team/Loadout/Build/BuildInfoAlert'
import LoadoutInfoAlert from '../../Components/Team/Loadout/LoadoutInfoAlert'
import LoadoutNameDesc from '../../Components/Team/Loadout/LoadoutNameDesc'
import { LoadoutDropdown } from '../LoadoutDropdown'
import { BuildEquipped } from './Build/BuildEquipped'
import BuildReal from './Build/BuildReal'
import BuildTc from './Build/BuildTc'

// TODO: Translation
const columns = { xs: 1, sm: 1, md: 2, lg: 2 }
export default function LoadoutSettingElement({
  buttonProps = {},
}: {
  buttonProps?: ButtonProps
}) {
  const database = useDatabase()
  const { teamId, teamChar, teamCharId, loadoutDatum } =
    useContext(TeamCharacterContext)

  const [open, setOpen] = useState(false)

  const onChangeTeamCharId = (newTeamCharId: string) => {
    const index = database.teams
      .get(teamId)!
      .loadoutData.findIndex(
        (loadoutDatum) => loadoutDatum?.teamCharId === teamCharId
      )
    if (index < 0) return
    database.teams.set(teamId, (team) => {
      team.loadoutData[index] = { teamCharId: newTeamCharId } as LoadoutDatum
    })
  }
  return (
    <>
      <Box display="flex" gap={1} alignItems="center">
        <BootstrapTooltip
          title={
            teamChar.description ? (
              <Typography>{teamChar.description}</Typography>
            ) : undefined
          }
        >
          <Button
            startIcon={<PersonIcon />}
            endIcon={<SettingsIcon />}
            color="info"
            onClick={() => setOpen((o) => !o)}
            {...buttonProps}
          >
            <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <strong>{teamChar.name}</strong>
              <Divider orientation="vertical" variant="middle" flexItem />
              <CheckroomIcon />
              <span>{database.teams.getActiveBuildName(loadoutDatum)}</span>
            </Typography>
          </Button>
        </BootstrapTooltip>
      </Box>

      <ModalWrapper open={open} onClose={() => setOpen(false)}>
        <CardThemed>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={1000} />
            }
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <PersonIcon />
                  <span>Loadout Settings</span>
                </Box>
              }
              action={
                <IconButton onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <LoadoutInfoAlert />
              <LoadoutDropdown
                teamCharId={teamCharId}
                onChangeTeamCharId={onChangeTeamCharId}
                dropdownBtnProps={{ fullWidth: true }}
              />
              <LoadoutNameDesc teamCharId={teamCharId} />
            </CardContent>
            <Divider />
            <BuildManagementContent />
          </Suspense>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

function BuildManagementContent() {
  const database = useDatabase()
  const {
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey, buildIds, buildTcIds },
  } = useContext(TeamCharacterContext)

  const weaponTypeKey = getCharData(characterKey).weaponType

  return (
    <>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CheckroomIcon />
            <span>Build Management</span>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <BuildInfoAlert />
        <Grid container columns={columns} spacing={2}>
          <Grid item xs={1}>
            <BuildEquipped active={loadoutDatum?.buildType === 'equipped'} />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h6">Builds</Typography>
          <Button
            startIcon={<AddIcon />}
            color="info"
            size="small"
            onClick={() => database.teamChars.newBuild(teamCharId)}
          >
            New Build
          </Button>
        </Box>

        <Box>
          <Grid container columns={columns} spacing={2}>
            {buildIds.map((id) => (
              <Grid item xs={1} key={id}>
                <BuildReal
                  buildId={id}
                  active={
                    loadoutDatum?.buildType === 'real' &&
                    loadoutDatum?.buildId === id
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h6">TC Builds</Typography>
          <Button
            startIcon={<AddIcon />}
            color="info"
            size="small"
            onClick={() =>
              database.teamChars.newBuildTcFromBuild(teamCharId, weaponTypeKey)
            }
          >
            New TC Build
          </Button>
        </Box>

        <Box>
          <Grid container columns={columns} spacing={2}>
            {buildTcIds.map((id) => (
              <Grid item xs={1} key={id}>
                <BuildTc
                  buildTcId={id}
                  active={
                    loadoutDatum?.buildType === 'tc' &&
                    loadoutDatum?.buildTcId === id
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </>
  )
}
