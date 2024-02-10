import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import { Box } from '@mui/material'
import CloseButton from '../../Components/CloseButton'
import LevelSelect from '../../Components/LevelSelect'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import TabOverview from './Tabs/TabOverview'
import TravelerElementSelect from './TravelerElementSelect'
import TravelerGenderSelect from './TravelerGenderSelect'

export default function Content({
  character,
  onClose,
}: {
  character: ICachedCharacter
  onClose?: () => void
}) {
  const characterDispatch = useCharacterReducer(character?.key ?? '')
  return (
    <>
      <Box display="flex" gap={1}>
        <TravelerElementSelect />
        <TravelerGenderSelect />
        {character && (
          <LevelSelect
            level={character.level}
            ascension={character.ascension}
            setBoth={characterDispatch}
          />
        )}
        {!!onClose && (
          <CloseButton onClick={onClose} sx={{ marginLeft: 'auto' }} />
        )}
      </Box>
      <TabOverview />
    </>
  )
}
