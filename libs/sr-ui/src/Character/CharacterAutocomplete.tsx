import { useForceUpdate } from '@genshin-optimizer/react-util'
import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import { allCharacterKeys } from '@genshin-optimizer/sr-consts'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/ui-common'
import { GeneralAutocomplete } from '@genshin-optimizer/ui-common'
import { objKeyMap } from '@genshin-optimizer/util'
import { Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../Context'

type CharacterAutocompleteProps = {
  charKey: CharacterKey | ''
  setCharKey: (v: CharacterKey | '') => void
}
export function CharacterAutocomplete({
  charKey,
  setCharKey,
}: CharacterAutocompleteProps) {
  const { database } = useDatabaseContext()
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
    () => charListDirty && objKeyMap(database.chars.keys, () => true),
    [charListDirty, database.chars.keys]
  )

  const charFavoriteMap = useMemo(
    () =>
      charFaveDirty &&
      objKeyMap(
        database.charMeta.keys,
        (k) => database.charMeta.get(k).favorite
      ),
    [charFaveDirty, database.charMeta]
  )

  const options: GeneralAutocompleteOption<CharacterKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: 'None', // TODO
      },
      ...allCharacterKeys.map(
        (key): GeneralAutocompleteOption<CharacterKey | ''> => ({
          key,
          label: key, // TODO
          favorite: charFavoriteMap[key],
          color: charDbMap[key] ? undefined : 'secondary',
        })
      ),
    ],
    [charDbMap, charFavoriteMap]
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
