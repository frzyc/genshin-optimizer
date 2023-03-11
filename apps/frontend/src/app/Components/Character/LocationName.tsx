import type { LocationKey } from '@genshin-optimizer/consts'
import { characterAsset } from '@genshin-optimizer/g-assets'
import { BusinessCenter } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCharSheet } from '../../Data/Characters'
import { DatabaseContext } from '../../Database/Database'
import useDBMeta from '../../ReactHooks/useDBMeta'
import CharIconSide from '../Image/CharIconSide'

export default function LocationName({ location }: { location: LocationKey }) {
  const { t } = useTranslation('ui')
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheet = useMemo(
    () =>
      location
        ? getCharSheet(database.chars.LocationToCharacterKey(location), gender)
        : undefined,
    [location, gender, database]
  )
  return (
    <Typography component="span">
      {location && characterSheet?.name ? (
        <Box>
          <CharIconSide
            src={characterAsset(
              database.chars.LocationToCharacterKey(location),
              'iconSide',
              gender
            )}
            size={3}
            sideMargin
          />
          <Box sx={{ pr: 1 }} component="span">
            {characterSheet.name}
          </Box>
        </Box>
      ) : (
        <span>
          <BusinessCenter sx={{ verticalAlign: 'text-bottom' }} />{' '}
          {t('inventory')}
        </span>
      )}
    </Typography>
  )
}
