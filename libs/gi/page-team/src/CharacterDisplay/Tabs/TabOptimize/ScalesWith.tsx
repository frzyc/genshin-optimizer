import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  ArtifactStatWithUnit,
  OptTargetContext,
} from '@genshin-optimizer/gi/ui'
import { Alert } from '@mui/material'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function ScalesWith() {
  const { t } = useTranslation('page_character_optimize')
  const { scalesWith } = useContext(OptTargetContext)
  return (
    !!scalesWith.size && (
      <Alert severity="info" variant="standard">
        <Trans t={t} i18nKey="optAlert.scalesWith">
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
      </Alert>
    )
  )
}
