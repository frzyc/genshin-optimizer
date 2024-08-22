import {
  CharacterCard,
  useCharacterContext,
  useLoadoutContext,
} from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function TeammateDisplay({ tab }: { tab?: string }) {
  const {
    loadoutMetadatum,
    loadout: { key: characterKey },
  } = useLoadoutContext()
  const { character } = useCharacterContext()
  return (
    <Box>
      {tab}
      <CharacterCard character={character!} />
    </Box>
  )
}
