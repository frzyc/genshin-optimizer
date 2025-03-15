'use client'
import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { notEmpty, toggleArr } from '@genshin-optimizer/common/util'
import type { Team } from '@genshin-optimizer/gi/db'
import { useDatabase, useTeam, useTeamChar } from '@genshin-optimizer/gi/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { dataContextObj } from '../../context/DataContext'
import { DataContext } from '../../context/DataContext'
import { useCharData } from '../../hooks/useCharData'
import { LoadoutHeaderContent } from '../character/editor/LoadoutHeaderContent'
export function TeamDelModal({
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
  const { t } = useTranslation('page_team')
  const database = useDatabase()
  const team = useTeam(teamId)!
  const { name, description, loadoutData } = team

  const inTeamsData = useMemo(
    () =>
      loadoutData.map((loadoutDatum) => {
        if (!loadoutDatum) return []
        const { teamCharId } = loadoutDatum
        return database.teams.values.filter(({ loadoutData: data }) =>
          data.find((datum) => datum?.teamCharId === teamCharId),
        )
      }),
    [database, loadoutData],
  )
  const [delArr, setDelArry] = useState(() =>
    inTeamsData
      .map((teams, i) => (teams.length === 1 ? i : undefined))
      .filter(notEmpty),
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
              <Box>{t('teamDelModal.teamName')}</Box>
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
            <Trans t={t} i18nKey={'teamDelModal.alert'}>
              Removing the team will remove: resonance buffs, and enemy configs
              stored in the team. Loadouts that are only in this team are also
              selected by default for deletion.
            </Trans>
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
            ) : null,
          )}
        </CardContent>
        <Divider />
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={onDelete}
          >
            {t('teamDelModal.delBtn')}
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
  const { t } = useTranslation('page_team')
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
        <Button
          fullWidth
          onClick={onClick}
          variant="outlined"
          color="neutral100"
          sx={{ p: 0 }}
        >
          <LoadoutHeaderContent teamCharId={teamCharId}>
            <ColorText color={inTeams.length === 1 ? 'success' : 'warning'}>
              <Typography>
                {inTeams.length === 1
                  ? t('teamDelModal.onlyCrrTeam')
                  : t('teamDelModal.usingMltTeams', { count: inTeams.length })}
              </Typography>
            </ColorText>
          </LoadoutHeaderContent>
        </Button>
      </CardThemed>
    </DataContext.Provider>
  )
}
