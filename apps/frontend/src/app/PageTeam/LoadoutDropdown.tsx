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

// TODO: Translation
export function LoadoutDropdown({
  teamCharId,
  onChangeTeamCharId,
  dropdownBtnProps = {},
}: {
  teamCharId: string
  onChangeTeamCharId: (teamCharId: string) => void
  dropdownBtnProps?: Omit<DropdownButtonProps, 'children' | 'title'>
}) {
  const database = useDatabase()
  const {
    key: characterKey,
    name,
    buildIds,
    buildTcIds,
  } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  const teamCharIds = database.teamChars.keys.filter(
    (teamCharId) => database.teamChars.get(teamCharId)!.key === characterKey
  )

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
              <>
                Create a new Loadout For{' '}
                <CharacterName characterKey={characterKey} gender={gender} />
              </>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              fullWidth
              label="New Loadout Name"
              placeholder="New Loadout Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              fullWidth
              label="New Loadout Description"
              placeholder="New Loadout Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              multiline
              rows={4}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="error" fullWidth onClick={onHide}>
                Cancel
              </Button>
              <Button
                color="success"
                fullWidth
                onClick={newLoadout}
                disabled={!newName}
              >
                Confirm
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
      <DropdownButton
        title={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <span>{name}</span>
            <SqBadge
              color={buildIds.length ? 'success' : 'secondary'}
              sx={{ marginLeft: 'auto' }}
            >
              {buildIds.length} Builds
            </SqBadge>
            <SqBadge color={buildTcIds.length ? 'success' : 'secondary'}>
              {buildTcIds.length} TC Builds
            </SqBadge>
          </Box>
        }
        {...dropdownBtnProps}
      >
        <MenuItem onClick={() => onShow()}>Create a new Loadout</MenuItem>
        {/* TODO: new loadout */}
        {teamCharIds.map((tcId) => {
          const { name, buildIds, buildTcIds } = database.teamChars.get(tcId)!
          return (
            <MenuItem
              key={tcId}
              disabled={tcId === teamCharId}
              onClick={() => onChangeTeamCharId(tcId)}
              sx={{ display: 'flex', gap: 1 }}
            >
              <span>{name}</span>
              <SqBadge
                color={buildIds.length ? 'primary' : 'secondary'}
                sx={{ marginLeft: 'auto' }}
              >
                {buildIds.length} Builds
              </SqBadge>
              <SqBadge color={buildTcIds.length ? 'primary' : 'secondary'}>
                {buildTcIds.length} TC Builds
              </SqBadge>
            </MenuItem>
          )
        })}
      </DropdownButton>
    </>
  )
}
