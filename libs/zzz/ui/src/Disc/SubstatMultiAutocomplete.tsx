import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { DiscSubStatKey } from '@genshin-optimizer/zzz/consts'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Chip } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function SubstatMultiAutocomplete<
  SubstatKeyParam extends DiscSubStatKey
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
  const { t: tk } = useTranslation('statKey_gen')
  const options = useMemo(
    () =>
      allSubstatKeys.map((key) => ({
        key,
        label: `${tk(key)}${getUnitStr(key)}`,
      })),
    [allSubstatKeys, tk]
  )
  const toImg = useCallback(
    (key: DiscSubStatKey) => (
      <StatIcon statKey={key} iconProps={iconInlineProps} />
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
