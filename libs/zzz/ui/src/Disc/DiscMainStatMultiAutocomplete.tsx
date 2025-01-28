import { GeneralAutocompleteMulti, ImgIcon } from '@genshin-optimizer/common/ui'
import type { DiscMainStatKey } from '@genshin-optimizer/zzz/consts'
import { allDiscMainStatKeys } from '@genshin-optimizer/zzz/consts'
import { Chip } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function DiscMainStatMultiAutocomplete({
  mainStatKeys,
  setMainStatKeys,
  totals,
}: {
  mainStatKeys: any[]
  setMainStatKeys: (keys: DiscMainStatKey[]) => void
  totals: any
}) {
  const { t } = useTranslation('artifact')
  const options = useMemo(
    () =>
      allDiscMainStatKeys.map((key) => ({
        key,
        label: key,
        variant: 'fix variant',
      })),
    []
  )

  console.log(options)
  const toImg = useCallback(
    (key: DiscMainStatKey) => <ImgIcon src={''} size={3} />,
    []
  )
  const toExLabel = useCallback(
    (key: DiscMainStatKey) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: DiscMainStatKey) => <Chip size="small" label={totals[key]} />,
    [totals]
  )
  return (
    <GeneralAutocompleteMulti
      options={options}
      valueKeys={mainStatKeys}
      onChange={setMainStatKeys}
      toImg={toImg}
      toExLabel={toExLabel}
      toExItemLabel={toExItemLabel}
      label={t('autocompleteLabels.mainStats')}
    />
  )
}
