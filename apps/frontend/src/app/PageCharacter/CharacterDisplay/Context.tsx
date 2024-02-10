import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import { Box } from '@mui/material'
import CloseButton from '../../Components/CloseButton'
import {
  HitModeToggle,
  InfusionAuraDropdown,
  ReactionToggle,
} from '../../Components/HitModeEditor'
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
      <Box display="flex">
        <Box display="flex" gap={1} flexWrap="wrap" flexGrow={1}>
          <TravelerElementSelect />
          <TravelerGenderSelect />
        </Box>
        {!!onClose && <CloseButton onClick={onClose} />}
      </Box>
      <Box display="flex" gap={1} flexWrap="wrap">
        {character && (
          <LevelSelect
            level={character.level}
            ascension={character.ascension}
            setBoth={characterDispatch}
          />
        )}
        <HitModeToggle size="small" />
        <InfusionAuraDropdown />
        <ReactionToggle size="small" />
      </Box>
      <TabOverview />
    </>
  )
}
