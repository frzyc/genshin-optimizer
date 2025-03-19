import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import {
  type LocationKey,
  allLocationKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Box, Chip, Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharIconCircle } from './CharIconCircleElement'

const toImg = (key: LocationKey) =>
  key ? (
    <Box>
      <CharIconCircle characterKey={key} />
    </Box>
  ) : undefined

export function LocationFilterMultiAutocomplete({
  locations,
  setLocations,
  totals,
  disabled,
}: {
  locations: LocationKey[]
  setLocations: (v: LocationKey[]) => void
  totals: Record<LocationKey, string>
  disabled?: boolean
}) {
  const { t } = useTranslation(['disc', 'charNames_gen'])
  const { database } = useDatabaseContext()

  const toExLabel = useCallback(
    (key: LocationKey) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: LocationKey) => <Chip size="small" label={totals[key]} />,
    [totals]
  )

  /* const isFavorite = useCallback(
    (key: LocationKey) =>
      key === 'Traveler'
        ? allTravelerKeys.some((key) => database.charMeta.get(key).favorite)
        : key
        ? database.charMeta.get(key).favorite
        : false,
    [database]
  ) needs favorite system */

  /* const toVariant = useCallback(
    (key: LocationKey) =>
      getCharEle(database.chars.locationToCharacterKey(key)),
    [database]
  ) */

  const values = useMemo(
    () =>
      allLocationKeys
        .filter((key) => database.chars.get(key))
        .map(
          (v): GeneralAutocompleteOption<LocationKey> => ({
            key: v,
            label: t(v),
            favorite: false,
            alternateNames: [v],
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    [database.chars, t]
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
        label={t('disc:filterLocation.location')}
        chipProps={{ variant: 'outlined' }}
      />
    </Suspense>
  )
}
