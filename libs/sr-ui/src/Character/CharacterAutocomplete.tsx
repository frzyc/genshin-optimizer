import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import { allCharacterKeys } from '@genshin-optimizer/sr-consts'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/ui-common'
import { GeneralAutocomplete } from '@genshin-optimizer/ui-common'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDatabaseContext } from '../Context'

type CharacterAutocompleteProps = {
  charKey: CharacterKey | ''
  setCharKey: (v: CharacterKey | '') => void
}
export function CharacterAutocomplete({
  charKey,
  setCharKey,
}: CharacterAutocompleteProps) {
  const { t } = useTranslation(['character', 'charNames_gen'])
  const { database } = useDatabaseContext()
  const charInDb = useCallback(
    (charKey: CharacterKey) => !!database.chars.get(charKey),
    [database.chars]
  )

  const charIsFavorite = useCallback(
    (charKey: CharacterKey) => database.charMeta.get(charKey).favorite,
    [database.charMeta]
  )

  const options: GeneralAutocompleteOption<CharacterKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: t('character:autocomplete.none'),
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
        options={options}
        toImg={() => <> </>} // TODO
        valueKey={charKey}
        onChange={(k) => setCharKey(k ?? '')}
      />
    </Suspense>
  )
}
