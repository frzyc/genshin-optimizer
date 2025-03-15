import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { DiscMainStatKey, StatKey } from '@genshin-optimizer/zzz/consts'
import { allDiscMainStatKeys } from '@genshin-optimizer/zzz/consts'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
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
  const { t } = useTranslation('disc')
  const { t: tk } = useTranslation('statKey_gen')
  const options = useMemo(
    () =>
      allDiscMainStatKeys.map((key) => ({
        key,
        label: `${tk(key)}${getUnitStr(key)}`,
        variant: 'fix variant',
      })),
    [tk],
  )

  const toImg = useCallback(
    (key: StatKey) => <StatIcon statKey={key} iconProps={iconInlineProps} />,
    [],
  )
  const toExLabel = useCallback(
    (key: DiscMainStatKey) => <strong>{totals[key]}</strong>,
    [totals],
  )
  const toExItemLabel = useCallback(
    (key: DiscMainStatKey) => <Chip size="small" label={totals[key]} />,
    [totals],
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
