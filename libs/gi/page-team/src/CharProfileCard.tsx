import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { CharacterContext, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import type { TalentSheetElementKey } from '@genshin-optimizer/gi/sheets'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import {
  CharacterCompactTalent,
  CharacterConstellationName,
  CharacterCoverArea,
  DataContext,
} from '@genshin-optimizer/gi/ui'
import { input } from '@genshin-optimizer/gi/wr'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CharProfileCharEditor } from './CharProfileCharEditor'

/* Image card with star and name and level */
export default function CharacterProfileCard() {
  const { t } = useTranslation('common')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()

  const [showEditor, onShowEditor, onHideEditor] = useBoolState()
  return (
    <CardThemed bgt="light" sx={{ height: '100%' }}>
      <CharacterCoverArea />
      <Box p={1}>
        <CharProfileCharEditor show={showEditor} onClose={onHideEditor} />
        <Box>
          <Button
            fullWidth
            color="info"
            onClick={onShowEditor}
            startIcon={<DriveFileRenameOutlineIcon />}
          >
            {t('edit')}
          </Button>
        </Box>

        <CharacterCompactTalent />

        <Typography sx={{ textAlign: 'center', mt: 1 }} variant="h6">
          <CharacterConstellationName
            characterKey={characterKey}
            gender={gender}
          />
        </Typography>
        <CharacterCompactConstellation />
      </Box>
    </CardThemed>
  )
}

export function CharacterCompactConstellation() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const constellation = data.get(input.constellation).value
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  return (
    <Grid container spacing={1}>
      {range(1, 6).map((i) => (
        <Grid item xs={4} key={i}>
          <Box
            component={NextImage ? NextImage : 'img'}
            src={
              characterSheet.getTalentOfKey(
                `constellation${i}` as TalentSheetElementKey,
              )?.img
            }
            sx={{
              ...(constellation >= i ? {} : { filter: 'brightness(50%)' }),
            }}
            width="100%"
            height="auto"
          />
        </Grid>
      ))}
    </Grid>
  )
}
