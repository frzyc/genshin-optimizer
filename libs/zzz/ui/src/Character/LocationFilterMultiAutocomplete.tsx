import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import type { LocationCharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allTravelerKeys,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { Chip, Skeleton } from '@mui/material'
import { t } from 'i18next'
import { Suspense, useCallback, useContext } from 'react'
import { CharIconSide } from '.'
import { SillyContext } from '../context'

export function LocationFilterMultiAutocomplete({
  locations,
  setLocations,
  totals,
  disabled,
}: {
  locations: any[]
  setLocations: (v: LocationCharacterKey[]) => void
  totals: any
  disabled?: boolean
}) {
  const database = useDatabase()
  const { silly } = useContext(SillyContext)
  const namesCB = useCallback(
    (key: LocationCharacterKey, silly: boolean): string =>
      t(
        `${
          silly ? 'sillyWisher_charNames' : 'charNames_gen'
        }:${charKeyToLocGenderedCharKey(
          database.chars.LocationToCharacterKey(key),
          'M'
        )}`
      ),
    [database, 'M', t]
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
      getCharEle(database.chars.LocationToCharacterKey(key)),
    [database]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocompleteMulti
        disabled={disabled}
        options={[]}
        valueKeys={locations}
        onChange={(k) => setLocations(k)}
        toImg={toImg}
        toExLabel={toExLabel}
        toExItemLabel={toExItemLabel}
        label={t('artifact:filterLocation.location')}
        chipProps={{ variant: 'outlined' }}
      />
    </Suspense>
  )
}
