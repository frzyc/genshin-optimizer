import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, ButtonGroup, Grid } from '@mui/material'
import { Suspense, useContext, useState } from 'react'
import CharIconSide from '../Components/Image/CharIconSide'
import { DatabaseContext } from '../Database/Database'
import useDBMeta from '../ReactHooks/useDBMeta'
import CharacterSelectionModal from '../Components/Character/CharacterSelectionModal'
export default function TeamCharacterSelector({
  teamId,
  currentCharIndex,
  setCurrentCharIndex,
}: {
  teamId: string
  currentCharIndex: number
  setCurrentCharIndex: (ind: number) => void
}) {
  const { database } = useContext(DatabaseContext)
  const team = database.teams.get(teamId)
  const { characterIds } = team
  const [charSelectIndex, setCharSelectIndex] = useState(
    undefined as number | undefined
  )
  const onSelect = (cKey: CharacterKey) => {
    if (charSelectIndex === undefined) return
    const teamCharId = database.teamChars.new(cKey)
    database.teams.set(teamId, (team) => {
      team.characterIds[charSelectIndex] = teamCharId
    })
  }
  const onDel = (index: number) => () => {
    const oldId = characterIds[index]
    database.teams.set(teamId, (team) => {
      team.characterIds[index] = undefined
    })
    database.teamChars.remove(oldId)
  }
  const charsInTeam = characterIds.map((id) => database.teamChars.get(id).key)
  return (
    <Box>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          filter={(c) =>
            !!database.chars.get(c?.key) && !charsInTeam.includes(c?.key)
          }
          show={charSelectIndex !== undefined}
          onHide={() => setCharSelectIndex(undefined)}
          onSelect={onSelect}
        />
      </Suspense>
      <Grid container columns={4} spacing={1}>
        {range(0, 3).map((ind) => (
          <Grid item key={ind} xs={1}>
            {characterIds[ind] ? (
              <CharSelButton
                teamCharId={characterIds[ind]}
                active={currentCharIndex === ind}
                onClick={() => setCurrentCharIndex(ind)}
                onClose={onDel(ind)}
              />
            ) : (
              <Button
                onClick={() => setCharSelectIndex(ind)}
                fullWidth
                sx={{ height: '100%' }}
                disabled={ind !== characterIds.length}
                startIcon={<AddIcon />}
              >
                Add Character
              </Button>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
function CharSelButton({
  teamCharId,
  onClick,
  onClose,
  active = false,
}: {
  teamCharId: string
  onClick: () => void
  onClose: () => void
  active: boolean
}) {
  const { database } = useContext(DatabaseContext)
  const { key: characterKey } = database.teamChars.get(teamCharId)
  const { gender } = useDBMeta()
  return (
    <ButtonGroup fullWidth sx={{ height: '100%' }}>
      <Button
        onClick={onClick}
        sx={{ height: '100%' }}
        color={active ? 'success' : 'primary'}
        startIcon={<CharIconSide characterKey={characterKey} />}
      >
        <CharacterName characterKey={characterKey} gender={gender} />
      </Button>
      <Button
        onClick={onClose}
        color="error"
        sx={{ flexBasis: '0', height: '100%' }}
        size="small"
      >
        <CloseIcon />
      </Button>
    </ButtonGroup>
  )
}
