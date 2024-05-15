import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { notEmpty, toggleArr } from '@genshin-optimizer/common/util'
import type { Team } from '@genshin-optimizer/gi/db'
import { useDatabase, useTeam, useTeamChar } from '@genshin-optimizer/gi/db-ui'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  DataContext,
  LoadoutHeaderContent,
  useCharData,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
export default function TeamDelModal({
  teamId,
  show,
  onHide,
  onDel,
}: {
  teamId: string
  show: boolean
  onHide: () => void
  onDel: () => void
}) {
  const database = useDatabase()
  const team = useTeam(teamId)!
  const { name, description, loadoutData } = team

  const inTeamsData = useMemo(
    () =>
      loadoutData.map((loadoutDatum) => {
        if (!loadoutDatum) return []
        const { teamCharId } = loadoutDatum
        return database.teams.values.filter(({ loadoutData: data }) =>
          data.find((datum) => datum?.teamCharId === teamCharId)
        )
      }),
    [database, loadoutData]
  )
  const [delArr, setDelArry] = useState(() =>
    inTeamsData
      .map((teams, i) => (teams.length === 1 ? i : undefined))
      .filter(notEmpty)
  )
  const onDelete = () => {
    database.teams.remove(teamId)
    loadoutData.forEach((loadoutDatum, i) => {
      if (!loadoutDatum || !delArr.includes(i)) return
      database.teamChars.remove(loadoutDatum.teamCharId)
    })
    onDel()
  }
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardHeader
          title={
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box>Delete Team:</Box>
              <strong>{name}</strong>
              {description && (
                <BootstrapTooltip title={description}>
                  <InfoIcon />
                </BootstrapTooltip>
              )}
            </Box>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Alert severity="info">
            Removing the team will remove: resonance buffs, and enemy configs
            stored in the team. Loadouts that are only in this team are also
            selected by default for deletion.
          </Alert>
          {loadoutData.map((loadoutDatum, i) =>
            loadoutDatum ? (
              <LoadoutDisplay
                key={i}
                teamCharId={loadoutDatum.teamCharId}
                selected={delArr.includes(i)}
                onClick={() => setDelArry((arr) => toggleArr(arr, i))}
                inTeams={inTeamsData[i]}
              />
            ) : null
          )}
        </CardContent>
        <Divider />
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function LoadoutDisplay({
  teamCharId,
  selected,
  onClick,
  inTeams,
}: {
  teamCharId: string
  selected: boolean
  onClick: () => void
  inTeams: Team[]
}) {
  const teamChar = useTeamChar(teamCharId)!
  const { key: characterKey } = teamChar
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
  if (!dataContextValue) return
  return (
    <DataContext.Provider value={dataContextValue}>
      <CardThemed
        bgt="light"
        sx={{ border: selected ? '2px red solid' : undefined }}
      >
        <CardActionArea onClick={onClick}>
          <LoadoutHeaderContent teamCharId={teamCharId}>
            <ColorText color={inTeams.length === 1 ? 'success' : 'warning'}>
              <Typography>
                {inTeams.length === 1
                  ? 'Only in current team'
                  : `In ${inTeams.length} teams`}
              </Typography>
            </ColorText>
          </LoadoutHeaderContent>
        </CardActionArea>
      </CardThemed>
    </DataContext.Provider>
  )
}
