import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { crawlObject, getUnitStr } from '@genshin-optimizer/common/util'
import type { LoadoutDatum, TeamCharacter } from '@genshin-optimizer/gi/db'
import {
  useDatabase,
  useOptConfig,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import AddIcon from '@mui/icons-material/Add'
import BarChartIcon from '@mui/icons-material/BarChart'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { OptimizationIcon } from '../../../consts'
import { DocumentDisplay } from '../../DocumentDisplay'
import { BuildInfoAlert, TCBuildInfoAlert } from '../../build'
import { LoadoutInfoAlert } from '../../loadout'
import { TeamCard, TeamInfoAlert } from '../../team'
import { BuildRealSimplified } from './BuildRealSimplified'
import { BuildTcSimplified } from './BuildTcSimplified'
import { OptimizationTargetDisplay } from './OptimizationTargetDisplay'
import { RemoveLoadout } from './RemoveLoadout'

export function LoadoutEditor({
  show,
  onHide,
  teamCharId,
  teamIds,
}: {
  show: boolean
  onHide: () => void
  teamCharId: string
  teamIds: string[]
}) {
  const { t } = useTranslation('loadout')
  const [showRemoval, onShowRemoval, onHideRemoval] = useBoolState()
  const navigate = useNavigate()
  const database = useDatabase()
  const {
    key: characterKey,
    name,
    description,
    buildIds,
    buildTcIds,
    customMultiTargets,
    bonusStats,
    optConfigId,
    conditional,
  } = useTeamChar(teamCharId)!
  const { optimizationTarget } = useOptConfig(optConfigId)!
  const onDelete = () => {
    onHide()
    database.teamChars.remove(teamCharId)
  }
  const onDup = () => {
    const newTeamCharId = database.teamChars.duplicate(teamCharId)
    if (!newTeamCharId) return
    onHide()
  }
  const onAddTeam = (teamCharId: string) => {
    const teamId = database.teams.new()
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    navigate(`/teams/${teamId}`)
  }
  const conditionalCount = useMemo(() => {
    let count = 0
    crawlObject(
      conditional,
      [],
      (o) => typeof o !== 'object',
      () => count++,
    )
    return count
  }, [conditional])
  return (
    <ModalWrapper
      open={show}
      onClose={onHide}
      containerProps={{ maxWidth: 'lg' }}
    >
      <CardThemed>
        <CardHeader
          title={
            <Box display="flex" gap={1} alignItems="center">
              <PersonIcon />
              <strong>{name}</strong>
            </Box>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LoadoutInfoAlert />
          <TextFieldLazy
            fullWidth
            label={t('loadoutEditor.label')}
            placeholder={t('loadoutEditor.placeholder')}
            value={name}
            onChange={(name) => database.teamChars.set(teamCharId, { name })}
          />
          <TextFieldLazy
            fullWidth
            label={t('loadoutEditor.desc')}
            value={description}
            onChange={(description) =>
              database.teamChars.set(teamCharId, { description })
            }
            multiline
            minRows={2}
          />
          <Box>
            <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
              <Grid item xs={1}>
                <Button
                  color="info"
                  onClick={() => onDup()}
                  fullWidth
                  startIcon={<ContentCopyIcon />}
                >
                  {t('loadoutEditor.dupBtn')}
                </Button>
              </Grid>
              <Grid item xs={1}>
                <RemoveLoadout
                  show={showRemoval}
                  onHide={onHideRemoval}
                  onDelete={onDelete}
                  teamCharId={teamCharId}
                  teamIds={teamIds}
                  conditionalCount={conditionalCount}
                />
                <Button
                  fullWidth
                  startIcon={<DeleteForeverIcon />}
                  color="error"
                  onClick={onShowRemoval}
                >
                  {t('loadoutEditor.delBtn')}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
              {!!Object.keys(bonusStats).length && (
                <Grid item xs={1}>
                  <BonusStatsCard bonusStats={bonusStats} />
                </Grid>
              )}
              {!!optimizationTarget && (
                <Grid item xs={1}>
                  <CardThemed bgt="light">
                    <CardHeader
                      title={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <OptimizationIcon />
                          <span>{t('loadoutEditor.optTarget')}</span>
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Stack
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={1}
                      >
                        <OptimizationTargetDisplay
                          optimizationTarget={optimizationTarget}
                          customMultiTargets={customMultiTargets}
                        />
                      </Stack>
                    </CardContent>
                  </CardThemed>
                </Grid>
              )}
              {!!customMultiTargets.length && (
                <Grid item xs={1}>
                  <MultiTargetCard customMultiTargets={customMultiTargets} />
                </Grid>
              )}
              <Grid item xs={1}>
                <CardThemed bgt="light">
                  <CardContent>
                    <Typography variant="h6">
                      {t('loadoutEditor.conditionals')}
                      <strong>{conditionalCount}</strong>
                    </Typography>
                  </CardContent>
                </CardThemed>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardHeader
          title={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <CheckroomIcon />
              <span>{t('loadoutEditor.builds')}</span>
            </Box>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <BuildInfoAlert />
          <Box>
            <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
              {buildIds.map((id) => (
                <Grid item xs={1} key={id}>
                  <BuildRealSimplified
                    buildId={id}
                    characterKey={characterKey}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <TCBuildInfoAlert />
          <Box>
            <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
              {buildTcIds.map((id) => (
                <Grid item xs={1} key={id}>
                  <BuildTcSimplified buildTcId={id} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardHeader
          title={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <CheckroomIcon />
              <span>{t('loadoutEditor.teams')}</span>
            </Box>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TeamInfoAlert />
          <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
            {teamIds.map((teamId) => (
              <Grid item xs={1} key={teamId}>
                <TeamCard
                  bgt="light"
                  teamId={teamId}
                  onClick={(cid) =>
                    navigate(`/teams/${teamId}${cid ? `/${cid}` : ''}`)
                  }
                />
              </Grid>
            ))}
            <Grid item xs={1}>
              <Button
                fullWidth
                sx={{ height: '100%', backgroundColor: 'contentLight.main' }}
                variant="outlined"
                onClick={() => onAddTeam(teamCharId)}
                color="info"
                startIcon={<AddIcon />}
              >
                {t('loadoutEditor.addNewTeam')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function BonusStatsCard({
  bonusStats,
}: {
  bonusStats: TeamCharacter['bonusStats']
}) {
  const { t } = useTranslation('loadout')
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BarChartIcon />
            <span>{t('loadoutEditor.bonusStats')}</span>
          </Box>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />

      <DocumentDisplay
        bgt="light"
        sections={[
          {
            fields: Object.entries(bonusStats).map(([key, value]) => ({
              text: KeyMap.getStr(key) ?? key,
              value: value,
              unit: getUnitStr(key),
            })),
          },
        ]}
      />
    </CardThemed>
  )
}
function MultiTargetCard({
  customMultiTargets,
}: {
  customMultiTargets: TeamCharacter['customMultiTargets']
}) {
  const { t } = useTranslation('loadout')
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <DashboardCustomizeIcon />
            <span>{t('loadoutEditor.mltTargets')}</span>
          </Box>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />

      <DocumentDisplay
        bgt="light"
        sections={[
          {
            fields: customMultiTargets.map(({ name, description }) => ({
              text: name,
              value: description ? (
                <Tooltip title={description}>
                  <InfoIcon />
                </Tooltip>
              ) : undefined,
            })),
          },
        ]}
      />
    </CardThemed>
  )
}
