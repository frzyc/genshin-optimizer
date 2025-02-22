import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type LocationAutocompleteProps = {
  locKey: CharacterKey | ''
  setLocKey: (v: CharacterKey | '') => void
}

export function LocationAutocomplete({
  locKey,
  setLocKey,
  ...props
}: LocationAutocompleteProps &
  Omit<
    AutocompleteProps<
      GeneralAutocompleteOption<CharacterKey | ''>,
      false,
      boolean,
      false
    >,
    'options' | 'valueKey' | 'onChange' | 'toImg' | 'renderInput'
  >) {
  const { t } = useTranslation(['common', 'charNames_gen'])
  const { database } = useDatabaseContext()

  const charInDb = useCallback(
    (characterKey: CharacterKey) => !!database.chars.get(characterKey),
    [database.chars]
  )

  const charIsFavorite = useCallback(
    (characterKey: CharacterKey) =>
      database.charMeta.get(characterKey).favorite,
    [database.charMeta]
  )

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

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={options}
        toImg={() => <> </>} // TODO
        valueKey={locKey}
        onChange={(k) => setLocKey(k ?? '')}
        {...props}
      />
    </Suspense>
  )
}
