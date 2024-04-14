import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { CharacterConstellationName } from '@genshin-optimizer/gi/ui'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { Box, Button, Typography } from '@mui/material'
import { useContext } from 'react'
import CharacterEditor from '../Components/Character/CharacterEditor'
import {
  CharacterCompactConstSelector,
  CharacterCompactTalent,
  CharacterCoverArea,
} from '../Components/Character/CharacterProfilePieces'
import { CharacterContext } from '../Context/CharacterContext'
/* Image card with star and name and level */
export default function CharacterProfileCard() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()

  const [showEditor, onShowEditor, onHideEditor] = useBoolState()
  return (
    <CardThemed bgt="light" sx={{ height: '100%' }}>
      <CharacterCoverArea />
      <Box>
        <CharacterEditor
          characterKey={showEditor ? characterKey : undefined}
          onClose={onHideEditor}
        />
        <Box sx={{ px: 1 }}>
          <Button
            fullWidth
            color="info"
            onClick={onShowEditor}
            startIcon={<DriveFileRenameOutlineIcon />}
          >
            {/* TODO: translation */}
            EDIT
          </Button>
        </Box>

        <CharacterCompactTalent />

        <Typography sx={{ textAlign: 'center', mt: 1 }} variant="h6">
          <CharacterConstellationName
            characterKey={characterKey}
            gender={gender}
          />
        </Typography>
        <CharacterCompactConstSelector />
      </Box>
    </CardThemed>
  )
}
