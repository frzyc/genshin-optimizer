import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { CharacterLocationKey } from '@genshin-optimizer/sr/consts'
import { allCharacterLocationKeys } from '@genshin-optimizer/sr/consts'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDatabaseContext } from '../Context'

type LocationAutocompleteProps = {
  locKey: CharacterLocationKey | ''
  setLocKey: (v: CharacterLocationKey | '') => void
}
export function LocationAutocomplete({
  locKey,
  setLocKey,
}: LocationAutocompleteProps) {
  const { t } = useTranslation(['character', 'charNames_gen'])
  const { database } = useDatabaseContext()

  const charInDb = useCallback(
    (locationKey: CharacterLocationKey) =>
      !!database.chars.get(database.chars.LocationToCharacterKey(locationKey)),
    [database.chars]
  )

  const charIsFavorite = useCallback(
    (locationKey: CharacterLocationKey) =>
      database.charMeta.get(
        database.charMeta.LocationToCharacterKey(locationKey)
      ).favorite,
    [database.charMeta]
  )

  const options: GeneralAutocompleteOption<CharacterLocationKey | ''>[] =
    useMemo(
      () => [
        {
          key: '',
          label: t('character:autocomplete.none'),
        },
        ...allCharacterLocationKeys.map(
          (key): GeneralAutocompleteOption<CharacterLocationKey | ''> => ({
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
        options={options}
        toImg={() => <> </>} // TODO
        valueKey={locKey}
        onChange={(k) => setLocKey(k ?? '')}
      />
    </Suspense>
  )
}
