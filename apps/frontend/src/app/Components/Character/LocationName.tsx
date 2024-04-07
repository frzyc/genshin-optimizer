import type { LocationKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import { CharIconSide } from '@genshin-optimizer/gi/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { TypographyProps } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function LocationName({
  location,
  ...props
}: { location: LocationKey } & TypographyProps) {
  const { t } = useTranslation('ui')
  const database = useDatabase()
  const { gender } = useDBMeta()
  const characterSheet = useMemo(
    () =>
      location
        ? getCharSheet(database.chars.LocationToCharacterKey(location), gender)
        : undefined,
    [location, gender, database]
  )
  return (
    <Typography component="span" {...props}>
      {location && characterSheet?.name ? (
        <Box>
          <CharIconSide
            characterKey={database.chars.LocationToCharacterKey(location)}
          />
          <Box sx={{ pl: 1 }} component="span">
            {characterSheet.name}
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
