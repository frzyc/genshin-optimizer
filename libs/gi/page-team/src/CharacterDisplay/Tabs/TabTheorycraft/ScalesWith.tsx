import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  ArtifactStatWithUnit,
  OptTargetContext,
} from '@genshin-optimizer/gi/ui'
import { Alert } from '@mui/material'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function ScalesWith({
  minOtherRolls,
}: {
  minOtherRolls: number
}) {
  const { t } = useTranslation('page_character')
  const { scalesWith } = useContext(OptTargetContext)
  return (
    !!scalesWith.size && (
      <Alert severity="info" variant="standard">
        <Trans t={t} i18nKey="tabTheorycraft.optAlert.scalesWith">
          The selected Optimization target and constraints scales with:{' '}
        </Trans>
        {new Intl.ListFormat()
          .format(Array(scalesWith.size).fill('\u200B'))
          .split(/([^\u200B]+)/)
          .map((str, i) =>
            str === '\u200B'
              ? ((k) => (
                  <strong key={k}>
                    <StatIcon statKey={k} iconProps={iconInlineProps} />
                    <ArtifactStatWithUnit statKey={k} />
                  </strong>
                ))([...scalesWith][i / 2])
              : str,
          )}
        <Trans t={t} i18nKey="tabTheorycraft.optAlert.distribute">
          . The solver will only distribute stats to these substats.
        </Trans>{' '}
        {minOtherRolls > 0 && (
          <Trans t={t} i18nKey="tabTheorycraft.optAlert.feasibilty">
            There may be additional leftover substats that should be distributed
            to non-scaling stats to ensure the solution is feasible.
          </Trans>
        )}
      </Alert>
    )
  )
}
