import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import {
  CharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LevelSelect } from '../../LevelSelect'
import { CharacterCardStats } from '../card'
import {
  CharacterCompactMindscapeSelector,
  CharacterCoverArea,
} from '../CharacterProfilePieces'
import { TalentDropdown } from '../TalentDropdown'

export function Content({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation(['page_characters'])
  const navigate = useNavigate()
  const { database } = useDatabaseContext()
  const {
    character,
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const deleteCharacter = useCallback(async () => {
    const name = t(`${characterKey}`)
    if (!window.confirm(t('removeCharacter', { value: name }))) return
    database.chars.remove(characterKey)
    navigate('/characters')
  }, [database, navigate, characterKey, t])
  const talentKeys = allSkillKeys.filter((skill) => skill !== 'core')

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
              <CharacterCoverArea />
              <Box sx={{ px: 1 }}>
                <LevelSelect
                  level={character.level}
                  ascension={character.ascension}
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
                {talentKeys.map((talentKey) => (
                  <Grid item xs={1} key={talentKey}>
                    <TalentDropdown
                      key={talentKey}
                      talentKey={talentKey}
                      dropDownButtonProps={{
                        startIcon: (
                          <ImgIcon
                            src={commonDefIcon(talentKey)}
                            size={1.75}
                            sideMargin
                          />
                        ),
                      }}
                      setTalent={(talent) =>
                        database.chars.set(characterKey, (char) => {
                          char.talent[talentKey] = talent
                        })
                      }
                    />
                  </Grid>
                ))}
                <Grid item xs={1} key={'core'}>
                  <TalentDropdown
                    dropDownButtonProps={{
                      startIcon: (
                        <ImgIcon
                          src={commonDefIcon('core')}
                          size={1.75}
                          sideMargin
                        />
                      ),
                    }}
                    setTalent={(core) => {
                      database.chars.set(characterKey, (char) => {
                        char['core'] = core
                      })
                    }}
                  />
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
