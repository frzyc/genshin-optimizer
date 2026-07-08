import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { CharacterSheet } from '@genshin-optimizer/gi/sheets'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import { CloseIcon, DocumentDisplay } from '@genshin-optimizer/gi/ui'
import { DashboardCustomize } from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function ConditionalModal() {
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { team } = useContext(TeamCharacterContext)
  const [show, onShow, onCloseModal] = useBoolState(false)

  // todo: also need to add equipped weapons and artifacts
  const sheets = team.loadoutData
    .map((loadout): [CharacterKey, CharacterSheet] | null => {
      const key = database.teamChars.get(loadout?.teamCharId)?.key
      if (!key) return null
      return [key, getCharSheet(key, database.gender)]
    })
    .filter(notEmpty)

  return (
    <>
      <Button onClick={onShow}>{t('multiTarget.conditionals.open')}</Button>

      <ModalWrapper
        open={show}
        onClose={onCloseModal}
        containerProps={{ sx: { overflow: 'visible' } }}
      >
        <CardThemed bgt="light">
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                <DashboardCustomize />
                <Typography variant="h6">{t('multiTarget.title')}</Typography>
              </Box>
            }
            action={
              <IconButton onClick={onCloseModal}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box>
              <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
                {sheets.map(([cKey, sheet]) => (
                  <Grid item key={cKey} xs={1}>
                    {Object.entries(sheet.sheet).map(([tKey, talent]) => (
                      <DocumentDisplay
                        key={tKey}
                        sections={talent.sections.filter(
                          (section) => 'states' in section || section.teamBuff
                        )}
                      />
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
