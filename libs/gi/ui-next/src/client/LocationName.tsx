import type {
  GenderKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { CharIconSide, CharacterName } from '@genshin-optimizer/gi/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { TypographyProps } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { GenshinUserContext } from './GenshinUserDataWrapper'
import { locationCharacterKeyToCharacterKey } from './util'

export default function LocationName({
  location,
  ...props
}: { location?: LocationCharacterKey | null } & TypographyProps) {
  const { t } = useTranslation('ui')
  const gender: GenderKey = 'F' //TODO:  const { gender } = useDBMeta()
  const { characters } = useContext(GenshinUserContext)

  const charKey =
    location &&
    locationCharacterKeyToCharacterKey(
      location,
      (characters as ICharacter[] | undefined) ?? []
    )
  return (
    <Typography component="span" {...props}>
      {charKey ? (
        <Box>
          <CharIconSide characterKey={charKey} />
          <Box sx={{ pl: 1 }} component="span">
            <CharacterName characterKey={charKey} gender={gender} />
          </Box>
        </Box>
      ) : (
        <Box>
          <BusinessCenterIcon sx={{ verticalAlign: 'text-bottom' }} />{' '}
          {t('inventory')}
        </Box>
      )}
    </Typography>
  )
}
