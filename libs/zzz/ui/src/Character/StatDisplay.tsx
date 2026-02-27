import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { getUnitStr } from '@genshin-optimizer/common/util'
import { type StatKey } from '@genshin-optimizer/zzz/consts'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { useTranslation } from 'react-i18next'

export function StatDisplay({
  statKey,
  showPercent = false,
  disableIcon = false,
}: {
  statKey: StatKey
  showPercent?: boolean
  disableIcon?: boolean
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const text = (
    <span>
      {tk(statKey)}
      {showPercent && getUnitStr(statKey)}
    </span>
  )
  if (disableIcon) return text
  return (
    <span>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}{' '}
      {text}
    </span>
  )
}
