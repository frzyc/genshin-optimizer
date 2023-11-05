import type {
  CharacterKey,
  GenderKey,
  LocationCharacterKey,
  LocationKey,
} from '@genshin-optimizer/consts'
import {
  charKeyToLocCharKey,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/consts'
import type { ICharacter } from '@genshin-optimizer/gi-good'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/ui-common'
import { GeneralAutocomplete } from '@genshin-optimizer/ui-common'
import { getRandBool } from '@genshin-optimizer/util'
import { BusinessCenter } from '@mui/icons-material'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharIconSide } from './CharIconSide'
import { GenshinUserContext } from './GenshinUserDataWrapper'
import { SillyContext } from './SillyContext'
import { locationCharacterKeyToCharacterKey } from './util'

type LocationAutocompleteProps = {
  location: LocationCharacterKey | null
  setLocation: (v: LocationCharacterKey | null) => void
  // filter?: (v: CharacterSheet) => void
  autoCompleteProps?: Omit<
    AutocompleteProps<
      GeneralAutocompleteOption<LocationKey>,
      false,
      false,
      false
    >,
    'renderInput' | 'onChange' | 'options'
  >
}
export function LocationAutocomplete({
  location,
  setLocation,
  // filter = () => true,
  autoCompleteProps = {},
}: LocationAutocompleteProps) {
  const { t } = useTranslation([
    // 'ui',
    'artifact',
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const { characters } = useContext(GenshinUserContext)

  const { silly } = useContext(SillyContext)

  const gender: GenderKey = 'F' // TODO: const { gender } = useDBMeta()
  const toText = useCallback(
    (silly: boolean) =>
      (key: LocationCharacterKey): string =>
        t(
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen'
          }:${charKeyToLocGenderedCharKey(
            locationCharacterKeyToCharacterKey(key, characters as ICharacter[]),
            gender
          )}`
        ),
    [characters, gender, t]
  )
  const toImg = useCallback(
    (key: LocationKey) =>
      key === '' ? (
        <BusinessCenter />
      ) : (
        <CharIconSide
          characterKey={locationCharacterKeyToCharacterKey(
            key,
            characters as ICharacter[]
          )}
        />
      ),
    [characters]
  )
  const isFavorite = useCallback(
    () => getRandBool(), //TODO:
    []
  )

  const options: GeneralAutocompleteOption<LocationCharacterKey | ''>[] =
    useMemo(
      () => [
        {
          key: '',
          label: t`artifact:filterLocation.inventory`,
        },
        ...(characters ?? [])
          // TODO: filter()
          .map(({ key }) => charKeyToLocCharKey(key as CharacterKey))
          .map((v) => ({
            key: v,
            label: toText(silly)(v),
            favorite: isFavorite(),
            alternateNames: silly ? [toText(!silly)(v)] : undefined,
          }))
          .sort((a, b) => {
            if (a.favorite && !b.favorite) return -1
            if (!a.favorite && b.favorite) return 1
            return a.label.localeCompare(b.label)
          }),
      ],
      [t, characters, toText, silly, isFavorite]
    )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={options}
        valueKey={location ?? ''}
        onChange={(k) => setLocation(k || null)}
        toImg={toImg}
        {...autoCompleteProps}
      />
    </Suspense>
  )
}
