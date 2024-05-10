import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type { CustomMultiTarget, LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataContext } from '../../../context'
import { getDisplayHeader, resolveInfo } from '../../../util'
import { TeamCard } from '../../team'
import { LoadoutEditor } from './LoadoutEditor'
const columns = {
  xs: 1,
  md: 2,
} as const

// TODO: Translation
export function LoadoutCard({
  teamCharId,
  teamIds,
}: {
  teamCharId: string
  teamIds: string[]
}) {
  const navigate = useNavigate()
  const database = useDatabase()
  const {
    name,
    description,
    buildIds,
    buildTcIds,
    optConfigId,
    customMultiTargets,
  } = database.teamChars.get(teamCharId)!
  const { optimizationTarget } = useOptConfig(optConfigId)!
  const onAddTeam = (teamCharId: string) => {
    const teamId = database.teams.new()
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    navigate(`/teams/${teamId}`)
  }
  const [show, onShow, onHide] = useBoolState()
  return (
    <>
      <LoadoutEditor
        show={show}
        onHide={onHide}
        teamCharId={teamCharId}
        teamIds={teamIds}
      />
      <CardThemed key={teamCharId} bgt="light">
        <CardActionArea onClick={onShow}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <PersonIcon />
              <Typography variant="h6">{name}</Typography>
              {!!description && (
                <BootstrapTooltip
                  title={<Typography>{description}</Typography>}
                >
                  <InfoIcon />
                </BootstrapTooltip>
              )}

              <SettingsIcon sx={{ ml: 'auto' }} />
            </Box>
            <Box
              sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', justifyItems: 'center', gap: 1 }}>
                <CheckroomIcon />
                <Typography>
                  Builds: <strong>{buildIds.length}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyItems: 'center', gap: 1 }}>
                <CheckroomIcon />
                <Typography>
                  TC Builds: <strong>{buildTcIds.length}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyItems: 'center', gap: 1 }}>
                <DashboardCustomizeIcon />
                <Typography>
                  Custom multi-targets:{' '}
                  <strong>{customMultiTargets.length}</strong>
                </Typography>
              </Box>
            </Box>
            {optimizationTarget && (
              <OptimizationTargetDisplay
                customMultiTargets={customMultiTargets}
                optimizationTarget={optimizationTarget}
              />
            )}
          </CardContent>
        </CardActionArea>
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <Grid container columns={columns} spacing={1}>
            {teamIds.map((teamId) => (
              <Grid item xs={1} key={teamId}>
                <TeamCard
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
                sx={{ height: '100%', backgroundColor: 'contentNormal.main' }}
                variant="outlined"
                onClick={() => onAddTeam(teamCharId)}
                color="info"
                startIcon={<AddIcon />}
              >
                Add new Team
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
    </>
  )
}
function OptimizationTargetDisplay({
  optimizationTarget,
  customMultiTargets,
}: {
  optimizationTarget: string[]
  customMultiTargets: CustomMultiTarget[]
}) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const displayHeader = useMemo(
    () => getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database]
  )

  const { title, icon, action } = displayHeader ?? {}
  const node: CalcResult | undefined = objPathValue(
    data.getDisplay(),
    optimizationTarget
  ) as any

  const {
    textSuffix,
    icon: infoIcon,
    // Since mtargets are not passed in the character UIData, retrieve the name manually.
    name = optimizationTarget[0] === 'custom'
      ? customMultiTargets[parseInt(optimizationTarget[1] ?? '')]?.name
      : undefined,
  } = (node && resolveInfo(node.info)) ?? {}

  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? icon : infoIcon
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TrendingUpIcon />
      <Typography>Optimization Target:</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {iconDisplay}
        <span>{title}</span>
        {!!action && (
          <SqBadge color="success" sx={{ whiteSpace: 'normal' }}>
            {action}
          </SqBadge>
        )}
      </Box>
      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
        <SqBadge sx={{ whiteSpace: 'normal' }}>
          <strong>{name}</strong>
          {suffixDisplay}
        </SqBadge>
      </Typography>
    </Box>
  )
}
