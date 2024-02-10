import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type {
  LocationCharacterKey,
  LocationKey,
} from '@genshin-optimizer/gi/consts'
import {
  allLocationCharacterKeys,
  allTravelerKeys,
  charKeyToLocCharKey,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { BusinessCenter } from '@mui/icons-material'
import type { AutocompleteProps } from '@mui/material'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import type CharacterSheet from '../../Data/Characters/CharacterSheet'
import type { Variant } from '../../Formula/type'
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
  const database = useDatabase()
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

  const [charListDirty, setCharListDirty] = useForceUpdate()
  useEffect(
    () => database.arts.followAny(() => setCharListDirty()),
    [database, setCharListDirty]
  )

  const charInDb = useMemo(
    () =>
      charListDirty && database.chars.keys.map((c) => charKeyToLocCharKey(c)),
    [charListDirty, database]
  )

  const toImg = useCallback(
    (key: LocationKey) =>
      key === '' ? (
        <BusinessCenter />
      ) : (
        <Box sx={{ opacity: charInDb.includes(key) ? undefined : 0.7 }}>
          <CharIconSide
            characterKey={database.chars.LocationToCharacterKey(key)}
          />
        </Box>
      ),
    [database, charInDb]
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
          allLocationCharacterKeys.filter((k) =>
            filter(
              getCharSheet(database.chars.LocationToCharacterKey(k), gender)
            )
          )
        )
      )
        .map(
          (v): GeneralAutocompleteOption<LocationKey> => ({
            key: v,
            label: toText(silly)(v),
            favorite: isFavorite(v),
            alternateNames: silly ? [toText(!silly)(v)] : undefined,
            color: charInDb.includes(v) ? undefined : ('secondary' as Variant),
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          if (!a.color && b.color) return -1
          if (a.color && !b.color) return 1
          return a.label.localeCompare(b.label)
        }),
    ],
    [t, database.chars, gender, charInDb, filter, toText, silly, isFavorite]
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
