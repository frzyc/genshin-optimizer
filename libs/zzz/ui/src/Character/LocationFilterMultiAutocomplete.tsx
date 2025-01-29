import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocompleteMulti, ImgIcon } from '@genshin-optimizer/common/ui'
import {
  allLocationKeys,
  type LocationKey,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Chip, Skeleton } from '@mui/material'
import { t } from 'i18next'
import { Suspense, useCallback, useMemo } from 'react'

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
  /* const { t } = useTranslation([
      'disc',
      'sillyWisher_charNames',
      'charNames_gen',
    ]) Needs translation */
  const { database } = useDatabaseContext()

  const toImg = useCallback(() => <ImgIcon src={''} size={3} />, [])

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
            label: v,
            favorite: false,
            alternateNames: [v],
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    [database.chars]
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
        label={t('artifact:filterLocation.location')}
        chipProps={{ variant: 'outlined' }}
      />
    </Suspense>
  )
}
