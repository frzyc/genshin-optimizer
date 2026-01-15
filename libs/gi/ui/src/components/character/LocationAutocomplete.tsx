import { useDataManagerKeys } from '@genshin-optimizer/common/database-ui'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type {
  CharacterKey,
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
import type { Variant } from '@genshin-optimizer/gi/wr'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import type { AutocompleteProps } from '@mui/material'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../../context'
import { CharIconSide } from './CharIconSideElement'
type LocationAutocompleteProps = {
  location: LocationKey
  setLocation: (v: LocationKey) => void
  filter?: (v: CharacterKey) => void
  autoCompleteProps?: Omit<
    AutocompleteProps<
      GeneralAutocompleteOption<LocationKey>,
      false,
      boolean,
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
    'sillywisher_charNames_gen',
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
            silly ? 'sillywisher_charNames_gen' : 'charNames_gen'
          }:${charKeyToLocGenderedCharKey(
            database.chars.LocationToCharacterKey(key),
            gender
          )}`
        ),
    [database, gender, t]
  )

  const charKeys = useDataManagerKeys(database.chars)
  const charInDb = useMemo(
    () => charKeys.map((c) => charKeyToLocCharKey(c)),
    [charKeys]
  )

  const toImg = useCallback(
    (key: LocationKey) =>
      key === '' ? (
        <BusinessCenterIcon />
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
        label: t('artifact:filterLocation.inventory'),
      },
      ...Array.from(
        new Set(
          allLocationCharacterKeys.filter((k) =>
            filter(database.chars.LocationToCharacterKey(k))
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
    [t, database, charInDb, filter, toText, silly, isFavorite]
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
