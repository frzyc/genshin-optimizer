import {
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { LoadoutIcon, LoadoutInfoAlert } from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import { CardContent, CardHeader, Divider, IconButton } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadoutDropdown } from '../LoadoutDropdown'
import { CustomMultiTargetButton } from './CustomMultiTarget/CustomMultiTargetButton'
import { DetailStatButton } from './DetailStatButton'

export function LoadoutEditorModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { teamId, teamChar, teamCharId } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_team')

  const handleName = (loadoutName: string): void => {
    database.teamChars.set(teamCharId, { name: loadoutName })
  }

  const handleDesc = (loudoutDesc: string): void => {
    database.teamChars.set(teamCharId, { description: loudoutDesc })
  }

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
  const elementKey = getCharEle(teamChar.key)

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title={t('loadout.edit')}
          avatar={<LoadoutIcon />}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LoadoutInfoAlert />
          <DetailStatButton
            buttonProps={{
              sx: { backgroundColor: 'contentLight.main', flexGrow: 1 },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
          />
          <CustomMultiTargetButton
            buttonProps={{
              sx: { backgroundColor: 'contentLight.main', flexGrow: 1 },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
          />
          <LoadoutDropdown
            teamCharId={teamCharId}
            onChangeTeamCharId={onChangeTeamCharId}
            dropdownBtnProps={{
              fullWidth: true,
              sx: { flexGrow: 1, backgroundColor: 'contentLight.main' },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
            label
          />
          <TextFieldLazy
            label={t('loadout.name')}
            value={teamChar.name}
            onChange={handleName}
            autoFocus
          />
          <TextFieldLazy
            label={t('loadout.desc')}
            value={teamChar.description}
            onChange={handleDesc}
            multiline
            minRows={4}
          />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
