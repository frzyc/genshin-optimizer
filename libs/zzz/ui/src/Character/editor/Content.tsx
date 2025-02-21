import { CardThemed } from '@genshin-optimizer/common/ui'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LevelSelect } from '../../LevelSelect'
import { CharacterCardStats } from '../card'
import {
  CharacterCompactMindscapeSelector,
  CharacterCoverArea,
} from '../CharacterProfilePieces'
import { CoreDropdown } from '../CoreDropdown'
import { SkillDropdown } from '../SkillDropdown'
export function Content({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation(['page_characters'])
  const navigate = useNavigate()
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const { key: characterKey } = character
  const deleteCharacter = useCallback(async () => {
    const name = t(`${characterKey}`)
    if (!window.confirm(t('removeCharacter', { value: name }))) return
    database.chars.remove(characterKey)
    navigate('/characters')
  }, [database, navigate, characterKey, t])

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        <Button
          color="error"
          onClick={() => deleteCharacter()}
          startIcon={<DeleteForeverIcon />}
          sx={{ marginLeft: 'auto' }}
        >
          {t('characterEditor.delete')}
        </Button>
        {!!onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid item xs={8} sm={5} md={4} lg={3}>
            <CardThemed
              bgt="light"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CharacterCoverArea character={character} />
              <Box sx={{ px: 1 }}>
                <LevelSelect
                  level={character.level}
                  milestone={character.promotion}
                  setBoth={(data) => {
                    database.chars.set(characterKey, data)
                  }}
                />
              </Box>
              <CharacterCardStats bgt="light" character={character} />
              <Typography sx={{ textAlign: 'center', pb: -1 }} variant="h6">
                {t('characterEditor.mindscapeTitle')}
              </Typography>
              <Box sx={{ px: 1 }}>
                <CharacterCompactMindscapeSelector
                  mindscape={character.mindscape}
                  setMindscape={(mindscape) =>
                    database.chars.set(characterKey, {
                      mindscape,
                    })
                  }
                />
              </Box>
            </CardThemed>
          </Grid>
          <Grid
            item
            xs={12}
            sm={7}
            md={8}
            lg={9}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box>
              <Grid container columns={3} spacing={1}>
                {allSkillKeys.map((sk) => (
                  <Grid item xs={1} key={sk}>
                    <SkillDropdown key={sk} skillKey={sk} />
                  </Grid>
                ))}
                <Grid item xs={1} key={'core'}>
                  <CoreDropdown />
                </Grid>
              </Grid>
            </Box>
            <EquipmentSection />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

function EquipmentSection() {
  return (
    <Box>
      <Box>Wengine View To Be Implemented</Box>
      <Box>Discs View To Be Implemented</Box>
    </Box>
  )
}
