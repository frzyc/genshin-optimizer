import { useForceUpdate } from '@genshin-optimizer/react-util'
import type { CharacterLocationKey } from '@genshin-optimizer/sr-consts'
import {
  allCharacterLocationKeys,
  charKeyToCharLocKey,
} from '@genshin-optimizer/sr-consts'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/ui-common'
import { GeneralAutocomplete } from '@genshin-optimizer/ui-common'
import { objKeyMap } from '@genshin-optimizer/util'
import { Skeleton } from '@mui/material'
import { Suspense, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DatabaseContext } from '../Context'

type LocationAutocompleteProps = {
  locKey: CharacterLocationKey | ''
  setLocKey: (v: CharacterLocationKey | '') => void
}
export function LocationAutocomplete({
  locKey,
  setLocKey,
}: LocationAutocompleteProps) {
  const { t } = useTranslation(['character', 'charNames_gen'])
  const { database } = useContext(DatabaseContext)
  const [charListDirty, setCharListDirty] = useForceUpdate()
  useEffect(
    () => database.chars.followAny(() => setCharListDirty()),
    [database, setCharListDirty]
  )
  const [charFaveDirty, setCharFaveDirty] = useForceUpdate()
  useEffect(
    () => database.charMeta.followAny(() => setCharFaveDirty()),
    [database, setCharFaveDirty]
  )

  const charDbMap = useMemo(
    () =>
      charListDirty &&
      objKeyMap(database.chars.keys.map(charKeyToCharLocKey), () => true),
    [charListDirty, database.chars.keys]
  )

  const charFavoriteMap = useMemo(
    () =>
      charFaveDirty &&
      objKeyMap(
        allCharacterLocationKeys,
        (k) =>
          database.charMeta.get(database.charMeta.LocationToCharacterKey(k))
            .favorite
      ),
    [charFaveDirty, database.charMeta]
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
            favorite: charFavoriteMap[key],
            color: charDbMap[key] ? undefined : 'secondary',
          })
        ),
      ],
      [charDbMap, charFavoriteMap, t]
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
