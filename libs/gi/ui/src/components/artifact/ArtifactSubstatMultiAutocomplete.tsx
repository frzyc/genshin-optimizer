import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { Chip } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { artStatPercent } from './util'

export function ArtifactSubstatMultiAutocomplete({
  substatKeys,
  setSubstatKeys,
  totals,
}: {
  substatKeys: SubstatKey[]
  setSubstatKeys: (keys: SubstatKey[]) => void
  totals: Record<SubstatKey, string>
}) {
  const { t } = useTranslation('artifact')
  const { t: tk } = useTranslation('statKey_gen')
  const options = useMemo(
    () =>
      allSubstatKeys.map((key) => ({
        key,
        label: `${tk(key)}${artStatPercent(key)}`,
      })),
    [tk]
  )
  const toImg = useCallback(
    (key: SubstatKey) => (
      <StatIcon statKey={key} iconProps={{ sx: { ml: 1 } }} />
    ),
    []
  )
  const toExLabel = useCallback(
    (key: SubstatKey) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: SubstatKey) => <Chip size="small" label={totals[key]} />,
    [totals]
  )
  return (
    <GeneralAutocompleteMulti
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
