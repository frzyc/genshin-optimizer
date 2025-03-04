import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CharIconCircle } from './CharIconCircleElement'
import { CharacterName } from './CharacterTrans'

export function LocationName({ location }: { location: LocationKey }) {
  const { t } = useTranslation(['ui', 'charNames_gen'])
  return (
    <Typography component="span">
      {location ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CharIconCircle characterKey={location} size={1.7} />
          <Box sx={{ pl: 1 }} component="span">
            <CharacterName characterKey={location}></CharacterName>
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
