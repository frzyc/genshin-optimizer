import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  characterAsset,
  characterKeyToGenderedKey,
} from '@genshin-optimizer/sr/assets'
import type { LocationKey } from '@genshin-optimizer/sr/consts'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { TypographyProps } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CharacterName } from '../Character'

export function LocationName({
  location,
  ...props
}: { location: LocationKey } & TypographyProps) {
  const { t } = useTranslation('ui')
  return (
    <Typography component="span" {...props}>
      {location ? (
        <Box>
          <ImgIcon
            size={2}
            sx={{ borderRadius: '50%' }}
            src={characterAsset(characterKeyToGenderedKey(location), 'icon')}
          />
          <Box sx={{ pl: 1 }} component="span">
            <CharacterName genderedKey={characterKeyToGenderedKey(location)} />
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
