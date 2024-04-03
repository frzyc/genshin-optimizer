import type { LocationKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharIconSide, CharacterName } from '@genshin-optimizer/gi/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { TypographyProps } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function LocationName({
  location,
  ...props
}: { location: LocationKey } & TypographyProps) {
  const { t } = useTranslation('ui')
  const database = useDatabase()
  const { gender } = useDBMeta()

  const characterKey =
    location && database.chars.LocationToCharacterKey(location)
  return (
    <Typography component="span" {...props}>
      {characterKey ? (
        <Box>
          <CharIconSide characterKey={characterKey} />
          <Box sx={{ pl: 1 }} component="span">
            <CharacterName characterKey={characterKey} gender={gender} />
          </Box>
        </Box>
      ) : (
        <span>
          <BusinessCenterIcon sx={{ verticalAlign: 'text-bottom' }} />{' '}
          {t('inventory')}
        </span>
      )}
    </Typography>
  )
}
