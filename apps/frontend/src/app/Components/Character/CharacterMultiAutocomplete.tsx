import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type {
  GeneralAutocompleteMultiProps,
  GeneralAutocompleteOption,
} from '@genshin-optimizer/common/ui'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CharIconSide from '../Image/CharIconSide'

export function CharacterMultiAutocomplete({
  charKeys,
  setCharKey,
  acProps,
}: {
  charKeys: CharacterKey[]
  setCharKey: (v: CharacterKey[]) => void
  acProps?: Partial<GeneralAutocompleteMultiProps<CharacterKey>>
}) {
  const { t } = useTranslation(['sillyWisher_charNames', 'charNames_gen'])
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const charIsFavorite = useCallback(
    (charKey: CharacterKey) => database.charMeta.get(charKey).favorite,
    [database.charMeta]
  )

  const toImg = useCallback(
    (key: CharacterKey) => <CharIconSide characterKey={key} />,
    []
  )
  const options: GeneralAutocompleteOption<CharacterKey>[] = useMemo(
    () =>
      database.chars.keys.map(
        (key): GeneralAutocompleteOption<CharacterKey> => ({
          key,
          label: t(
            `${
              silly ? 'sillyWisher_charNames' : 'charNames_gen'
            }:${charKeyToLocGenderedCharKey(key, gender)}`
          ),
          favorite: charIsFavorite(key),
        })
      ),
    [database, gender, silly, charIsFavorite, t]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocompleteMulti
        label="Characters"
        options={options}
        toImg={toImg}
        valueKeys={charKeys}
        onChange={(k) => setCharKey(k)}
        {...acProps}
      />
    </Suspense>
  )
}
