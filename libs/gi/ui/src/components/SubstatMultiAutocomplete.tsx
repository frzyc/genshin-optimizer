import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import type { SubstatKey, WeaponSubstatKey } from '@genshin-optimizer/gi/consts'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { Chip } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { statPercent } from './util'

export function SubstatMultiAutocomplete<
  SubstatKeyParam extends SubstatKey | WeaponSubstatKey,
>({
  substatKeys,
  setSubstatKeys,
  totals,
  fullWidth = false,
  allSubstatKeys,
}: {
  substatKeys: SubstatKeyParam[]
  setSubstatKeys: (keys: SubstatKeyParam[]) => void
  totals: Record<SubstatKeyParam, string>
  fullWidth?: boolean
  allSubstatKeys: SubstatKeyParam[]
}) {
  const { t } = useTranslation('artifact')
  const { t: tk } = useTranslation('statKey_gen')
  const options = useMemo(
    () =>
      allSubstatKeys.map((key) => ({
        key,
        label: `${tk(key)}${statPercent(key)}`,
      })),
    [tk, allSubstatKeys]
  )
  const toImg = useCallback(
    (key: SubstatKeyParam) => (
      <StatIcon statKey={key} iconProps={{ sx: { ml: 1 } }} />
    ),
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
