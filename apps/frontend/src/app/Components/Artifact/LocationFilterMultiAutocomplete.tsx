import type { LocationCharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allLocationCharacterKeys,
  allTravelerKeys,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Chip, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import type { GeneralAutocompleteOption } from '../GeneralAutocomplete'
import { GeneralAutocompleteMulti } from '../GeneralAutocomplete'
import CharIconSide from '../Image/CharIconSide'

export default function LocationFilterMultiAutocomplete({
  locations,
  setLocations,
  totals,
  disabled,
}: {
  locations: LocationCharacterKey[]
  setLocations: (v: LocationCharacterKey[]) => void
  totals: Record<LocationCharacterKey, string>
  disabled?: boolean
}) {
  const { t } = useTranslation([
    'artifact',
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const database = useDatabase()
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const namesCB = useCallback(
    (key: LocationCharacterKey, silly: boolean): string =>
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
    (key: LocationCharacterKey) => (
      <CharIconSide characterKey={database.chars.LocationToCharacterKey(key)} />
    ),
    [database]
  )

  const toExLabel = useCallback(
    (key: LocationCharacterKey) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: LocationCharacterKey) => <Chip size="small" label={totals[key]} />,
    [totals]
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

  const toVariant = useCallback(
    (key: LocationCharacterKey) =>
      getCharSheet(database.chars.LocationToCharacterKey(key), gender)
        .elementKey ?? undefined,
    [database, gender]
  )

  const values = useMemo(
    () =>
      allLocationCharacterKeys
        .filter((lck) =>
          database.chars.get(database.chars.LocationToCharacterKey(lck))
        )
        .map(
          (v): GeneralAutocompleteOption<LocationCharacterKey> => ({
            key: v,
            label: namesCB(v, silly),
            favorite: isFavorite(v),
            color: toVariant(v),
            alternateNames: [namesCB(v, false)],
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    [database.chars, isFavorite, toVariant, silly, namesCB]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocompleteMulti
        disabled={disabled}
        options={values}
        valueKeys={locations}
        onChange={(k) => setLocations(k)}
        toImg={toImg}
        toExLabel={toExLabel}
        toExItemLabel={toExItemLabel}
        label={t`artifact:filterLocation.location`}
        chipProps={{ variant: 'outlined' }}
      />
    </Suspense>
  )
}
