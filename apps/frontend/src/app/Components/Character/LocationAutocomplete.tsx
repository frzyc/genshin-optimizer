import type {
  LocationCharacterKey,
  LocationKey,
} from '@genshin-optimizer/consts'
import {
  allTravelerKeys,
  charKeyToLocCharKey,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/consts'
import { BusinessCenter } from '@mui/icons-material'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import type CharacterSheet from '../../Data/Characters/CharacterSheet'
import { DatabaseContext } from '../../Database/Database'
import useDBMeta from '../../ReactHooks/useDBMeta'
import type { GeneralAutocompleteOption } from '../GeneralAutocomplete'
import { GeneralAutocomplete } from '../GeneralAutocomplete'
import CharIconSide from '../Image/CharIconSide'
type LocationAutocompleteProps = {
  location: LocationKey
  setLocation: (v: LocationKey) => void
  filter?: (v: CharacterSheet) => void
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
  filter = () => true,
  autoCompleteProps = {},
}: LocationAutocompleteProps) {
  const { t } = useTranslation([
    'ui',
    'artifact',
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const { silly } = useContext(SillyContext)
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const toText = useCallback(
    (silly: boolean) =>
      (key: LocationCharacterKey): string =>
        t(
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen'
          }:${charKeyToLocGenderedCharKey(
            database.chars.LocationToCharacterKey(key),
            gender
          )}`
        ),
    [database, gender, t]
  )
  const toImg = useCallback(
    (key: LocationKey) =>
      key === '' ? (
        <BusinessCenter />
      ) : (
        <CharIconSide
          characterKey={database.chars.LocationToCharacterKey(key)}
        />
      ),
    [database]
  )
  const isFavorite = useCallback(
    (key: LocationCharacterKey) =>
      key === 'Traveler'
        ? allTravelerKeys.some((key) => database.charMeta.get(key).favorite)
        : key
        ? database.charMeta.get(key).favorite
        : false,
    [database]
  )

  const values: GeneralAutocompleteOption<LocationKey>[] = useMemo(
    () => [
      {
        key: '',
        label: t`artifact:filterLocation.inventory`,
      },
      ...Array.from(
        new Set(
          database.chars.keys
            .filter((k) =>
              getCharSheet(k, gender) ? filter(getCharSheet(k, gender)) : true
            )
            .map((k) => charKeyToLocCharKey(k))
        )
      )
        .map(
          (v): GeneralAutocompleteOption<LocationKey> => ({
            key: v,
            label: toText(silly)(v),
            favorite: isFavorite(v),
            alternateNames: silly ? [toText(!silly)(v)] : undefined,
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    ],
    [t, database.chars.keys, gender, filter, toText, silly, isFavorite]
  )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={values}
        valueKey={location}
        onChange={(k) => setLocation(k ?? '')}
        toImg={toImg}
        {...autoCompleteProps}
      />
    </Suspense>
  )
}
