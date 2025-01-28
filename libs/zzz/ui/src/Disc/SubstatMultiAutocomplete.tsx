import { GeneralAutocompleteMulti, ImgIcon } from '@genshin-optimizer/common/ui'
import type {
  DiscSubStatKey,
  WengineSubstatKey,
} from '@genshin-optimizer/zzz/consts'
import { Chip } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function SubstatMultiAutocomplete<
  SubstatKeyParam extends DiscSubStatKey | WengineSubstatKey
>({
  substatKeys,
  setSubstatKeys,
  totals,
  fullWidth = false,
  allSubstatKeys,
}: {
  substatKeys: SubstatKeyParam[]
  setSubstatKeys: (keys: SubstatKeyParam[]) => void
  totals: any
  fullWidth?: boolean
  allSubstatKeys: SubstatKeyParam[]
}) {
  const { t } = useTranslation('disc')
  const options = useMemo(
    () =>
      allSubstatKeys.map((key) => ({
        key,
        label: key,
      })),
    [allSubstatKeys]
  )
  const toImg = useCallback(
    (key: SubstatKeyParam) => <ImgIcon src={''} size={3} />,
    []
  )
  const toExLabel = useCallback(
    (key: SubstatKeyParam) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: SubstatKeyParam) => <Chip size="small" label={totals[key]} />,
    [totals]
  )
  return (
    <GeneralAutocompleteMulti
      fullWidth={fullWidth}
      options={options}
      toImg={toImg}
      toExLabel={toExLabel}
      toExItemLabel={toExItemLabel}
      valueKeys={substatKeys}
      onChange={setSubstatKeys}
      label={t('autocompleteLabels.substats')}
    />
  )
}
