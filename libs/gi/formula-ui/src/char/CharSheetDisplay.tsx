import { CardThemed } from '@genshin-optimizer/common/ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { Box, CardContent, Stack, Typography } from '@mui/material'
import { pandoCardSx } from '../pandoCardSx'
import type { TalentSheetElementKey } from './consts'
import { uiSheets } from './sheets'
import { TalentSheetElementHeading } from './TalentSheetElementHeading'

export function CharSheetDisplay({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const sheet = uiSheets[characterKey]
  if (!sheet) {
    return (
      <CardThemed bgt="light" sx={pandoCardSx}>
        <CardContent>
          <Typography>No Pando UISheet for this character.</Typography>
        </CardContent>
      </CardThemed>
    )
  }
  return (
    <Stack spacing={1}>
      {Object.entries(sheet).map(([talentKey, element]) =>
        element ? (
          <CardThemed key={talentKey} bgt="light" sx={pandoCardSx}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TalentSheetElementHeading
                    characterKey={characterKey}
                    talentKey={talentKey as TalentSheetElementKey}
                    iconSize={1.5}
                  />
                </Typography>
              </Box>
              {element.documents.map((doc, i) => (
                <DocumentDisplay
                  key={i}
                  document={doc}
                  typoVariant="body2"
                  collapse
                />
              ))}
            </CardContent>
          </CardThemed>
        ) : null
      )}
    </Stack>
  )
}
