import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export function LoadoutDropdown({
  teamCharId,
  onChangeTeamCharId,
  dropdownBtnProps = {},
  label = false,
  i18nNs = 'loadout',
}: {
  teamCharId: string
  onChangeTeamCharId: (teamCharId: string) => void
  dropdownBtnProps?: Omit<DropdownButtonProps, 'children' | 'title'>
  label?: boolean
  /** Use `playstyle` on the optimize context bar (user-facing copy). */
  i18nNs?: 'loadout' | 'playstyle'
}) {
  const { t } = useTranslation(i18nNs)
  const createModalKey =
    i18nNs === 'playstyle' ? 'createModal' : 'loDropdown.createModal'
  const createKey = i18nNs === 'playstyle' ? 'create' : 'loDropdown.create'
  const labelKey = i18nNs === 'playstyle' ? 'dropdownLabel' : 'loDropdown.label'
  const buildsKey = i18nNs === 'playstyle' ? undefined : 'loDropdown.builds'
  const tcsKey = i18nNs === 'playstyle' ? undefined : 'loDropdown.tcs'
  const multiKey = i18nNs === 'playstyle' ? undefined : 'loDropdown.multi'
  const database = useDatabase()
  const { key: characterKey, name } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  const teamCharIds = database.teamChars.entries
    .filter(([_, team]) => team.key === characterKey)
    .sort((a, b) => {
      const [, ateam] = a
      const [, bteam] = b
      return ateam.name.localeCompare(bteam.name)
    })
    .map(([teamId, _]) => teamId)

  const [show, onShow, onHide] = useBoolState()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const newLoadout = () => {
    const teamCharId = database.teamChars.new(characterKey, {
      name: newName,
      description: newDesc,
    })
    if (teamCharId) onChangeTeamCharId(teamCharId)
    onHide()
  }

  return (
    <>
      <ModalWrapper open={show} onClose={onHide}>
        <CardThemed>
          <CardHeader
            title={
              <Trans t={t} i18nKey={`${createModalKey}.title`}>
                Create a new Loadout For{' '}
                <CharacterName characterKey={characterKey} gender={gender} />
              </Trans>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              fullWidth
              label={t(`${createModalKey}.label`)}
              placeholder={t(`${createModalKey}.placeholder`)}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              fullWidth
              label={t(`${createModalKey}.desc`)}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              multiline
              minRows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="error" fullWidth onClick={onHide}>
                {t(`${createModalKey}.cancel`)}
              </Button>
              <Button
                color="success"
                fullWidth
                onClick={newLoadout}
                disabled={!newName}
              >
                {t(`${createModalKey}.confirm`)}
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
      <DropdownButton
        startIcon={<PersonIcon />}
        title={
          <Box
            sx={{
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {label ? (
              <span>
                {t(labelKey)}
                <strong>{name}</strong>
              </span>
            ) : (
              <span>{name}</span>
            )}
          </Box>
        }
        {...dropdownBtnProps}
      >
        <MenuItem onClick={() => onShow()}>{t(createKey)}</MenuItem>
        {teamCharIds.map((tcId) => {
          const { name, buildIds, buildTcIds, customMultiTargets } =
            database.teamChars.get(tcId)!
          return (
            <MenuItem
              key={tcId}
              disabled={tcId === teamCharId}
              onClick={() => onChangeTeamCharId(tcId)}
              sx={{ display: 'flex', gap: 1 }}
            >
              <span>{name}</span>
              {buildsKey && (
                <SqBadge
                  color={buildIds.length ? 'primary' : 'secondary'}
                  sx={{ marginLeft: 'auto' }}
                >
                  {t(buildsKey, { count: buildIds.length })}
                </SqBadge>
              )}
              {tcsKey && (
                <SqBadge color={buildTcIds.length ? 'primary' : 'secondary'}>
                  {t(tcsKey, { count: buildTcIds.length })}
                </SqBadge>
              )}
              {multiKey && (
                <SqBadge
                  color={customMultiTargets.length ? 'success' : 'secondary'}
                >
                  {t(multiKey, { count: customMultiTargets.length })}
                </SqBadge>
              )}
            </MenuItem>
          )
        })}
      </DropdownButton>
    </>
  )
}
