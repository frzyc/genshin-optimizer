import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { AutocompleteProps } from '@mui/material'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharIconCircle } from './CharIconCircleElement'

export function LocationAutocomplete({
  locKey,
  setLocKey,
  ...props
}: {
  locKey: CharacterKey | ''
  setLocKey: (v: CharacterKey | '') => void
} & Omit<
  AutocompleteProps<
    GeneralAutocompleteOption<CharacterKey | ''>,
    false,
    boolean,
    false
  >,
  'options' | 'valueKey' | 'onChange' | 'toImg' | 'renderInput'
>) {
  const { t } = useTranslation(['common', 'charNames_gen'])
  // const { database } = useDatabaseContext()

  const charInDb = useCallback((_: CharacterKey) => true, [])
  // useCallback(
  //   (characterKey: CharacterKey) => !!database.chars.get(characterKey),
  //   [database.chars]
  // )

  const charIsFavorite = useCallback((_: CharacterKey) => false, [])
  // useCallback(
  //   (characterKey: CharacterKey) =>
  //     database.charMeta.get(characterKey).favorite,
  //   [database.charMeta]
  // )

  const options: GeneralAutocompleteOption<CharacterKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: t('inventory'),
      },
      ...allCharacterKeys.map(
        (key): GeneralAutocompleteOption<CharacterKey | ''> => ({
          key,
          label: t(`charNames_gen:${key}`),
          favorite: charIsFavorite(key),
          color: charInDb(key) ? undefined : 'secondary',
        })
      ),
    ],
    [charInDb, charIsFavorite, t]
  )

  const toImg = useCallback(
    (key: typeof locKey) =>
      key === '' ? (
        <BusinessCenterIcon />
      ) : (
        <Box sx={{ opacity: charInDb(key) ? undefined : 0.7 }}>
          <CharIconCircle characterKey={key} />
        </Box>
      ),
    [charInDb]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={options}
        toImg={toImg}
        valueKey={locKey}
        onChange={(k) => setLocKey(k ?? '')}
        {...props}
      />
    </Suspense>
  )
}
