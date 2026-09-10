import { CardThemed } from '@genshin-optimizer/common/ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { CardContent, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { pandoCardSx } from '../pandoCardSx'
import type { TalentSheetElementKey } from './consts'
import { uiSheets } from './sheets'
import { TalentSheetElementHeading } from './TalentSheetElementHeading'

/** Kit conditionals marked `teamBuff` for a teammate slot. */
export function TeammateBuffSheetDisplay({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { t } = useTranslation('page_optimize')
  const sheet = uiSheets[characterKey]
  const sections = Object.entries(sheet ?? {}).flatMap(
    ([talentKey, element]) => {
      const documents =
        element?.documents.filter(
          (doc) => doc.type === 'conditional' && doc.conditional.teamBuff
        ) ?? []
      if (!documents.length) return []
      return [{ talentKey: talentKey as TalentSheetElementKey, documents }]
    }
  )

  if (!sections.length) {
    return (
      <CardThemed bgt="light" sx={pandoCardSx}>
        <CardContent>
          <Typography>{t('noTeamBuffs')}</Typography>
        </CardContent>
      </CardThemed>
    )
  }

  return (
    <Stack spacing={1}>
      {sections.map(({ talentKey, documents }) => (
        <CardThemed key={talentKey} bgt="light" sx={pandoCardSx}>
          <CardContent>
            <Typography
              variant="h6"
              component="div"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
            >
              <TalentSheetElementHeading
                characterKey={characterKey}
                talentKey={talentKey}
                iconSize={1.5}
              />
            </Typography>
            {documents.map((document, i) => (
              <DocumentDisplay
                key={i}
                document={document}
                typoVariant="body2"
                collapse
              />
            ))}
          </CardContent>
        </CardThemed>
      ))}
    </Stack>
  )
}
