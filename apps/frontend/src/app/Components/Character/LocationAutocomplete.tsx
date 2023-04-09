import type {
  LocationCharacterKey,
  LocationKey,
} from '@genshin-optimizer/consts'
import { allTravelerKeys, charKeyToLocCharKey } from '@genshin-optimizer/consts'
import { BusinessCenter } from '@mui/icons-material'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCharSheet } from '../../Data/Characters'
import type CharacterSheet from '../../Data/Characters/CharacterSheet'
import { DatabaseContext } from '../../Database/Database'
import useDBMeta from '../../ReactHooks/useDBMeta'
import { charKeyToCharName } from '../../Types/consts'
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
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const toTextSilly = useCallback(
    (key: LocationCharacterKey): string =>
      t(
        `sillyWisher_charNames:${charKeyToCharName(
          database.chars.LocationToCharacterKey(key),
          gender
        )}`
      ),
    [database, gender, t]
  )
  const toText = useCallback(
    (key: LocationCharacterKey): string =>
      t(
        `charNames_gen:${charKeyToCharName(
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
            label: toTextSilly(v),
            favorite: isFavorite(v),
            alternateNames: [toText(v)],
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    ],
    [t, database.chars.keys, gender, filter, toTextSilly, isFavorite, toText]
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
