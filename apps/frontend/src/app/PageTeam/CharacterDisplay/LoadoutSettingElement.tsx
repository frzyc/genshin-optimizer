import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import type { ButtonProps } from '@mui/material'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import {
  Suspense,
  useContext,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import CloseButton from '../../Components/CloseButton'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
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
  const {
    teamId,
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey, buildIds, buildTcIds },
  } = useContext(TeamCharacterContext)

  const weaponTypeKey = getCharData(characterKey).weaponType

  const teamChar = database.teamChars.get(teamCharId)!
  const [open, setOpen] = useState(false)

  const [name, setName] = useState(teamChar.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(teamChar.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on teamCharId change, to use the new team's name/desc
  useEffect(() => {
    const newTeamChar = database.teamChars.get(teamCharId)
    if (!newTeamChar) return
    const { name, description } = newTeamChar
    setName(name)
    setDesc(description)
  }, [database, teamCharId])

  useEffect(() => {
    database.teamChars.set(teamCharId, (teamChar) => {
      teamChar.name = nameDeferred
    })
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, nameDeferred])

  useEffect(() => {
    database.teamChars.set(teamCharId, (teamChar) => {
      teamChar.description = descDeferred
    })
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, descDeferred])

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
              <strong>{teamChar.name}</strong>{' '}
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
              action={<CloseButton onClick={() => setOpen(false)} />}
            />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Alert variant="filled" severity="info">
                <strong>Loadouts</strong> provides character context data,
                including bonus stats, conditionals, multi-targets, optimization
                config, and stores builds. A single <strong>Loadout</strong> can
                be used for many teams.
              </Alert>
              <LoadoutDropdown
                teamCharId={teamCharId}
                onChangeTeamCharId={onChangeTeamCharId}
                dropdownBtnProps={{ fullWidth: true }}
              />
              <TextField
                fullWidth
                label="Loadout Name"
                placeholder="Loadout Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Loadout Description"
                placeholder="Loadout Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                multiline
                minRows={2}
              />
            </CardContent>
            <Divider />
            <CardHeader
              title={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CheckroomIcon />
                  <span>Build Management</span>
                </Box>
              }
            />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Alert variant="filled" severity="info">
                A <strong>Build</strong> is comprised of a weapon and 5
                artifacts. A <strong>TC Build</strong> allows the artifacts to
                be created from its stats.
              </Alert>
              <Grid container columns={columns} spacing={2}>
                <Grid item xs={1}>
                  <BuildEquipped
                    active={loadoutDatum?.buildType === 'equipped'}
                  />
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
                    database.teamChars.newBuildTcFromBuild(
                      teamCharId,
                      weaponTypeKey
                    )
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
          </Suspense>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
