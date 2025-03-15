import { ColorText } from '@genshin-optimizer/common/ui'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'

/**
 * Quick and dirty color interpolation using Trans's component feature
 */
export function TransHack({ text }: { text: string }) {
  const string = useMemo(
    () =>
      text.replaceAll('<color=', '<ct color=').replaceAll('</color>', '</ct>'),
    [text],
  )
  return (
    <Trans
      i18nKey={'invalid'}
      defaults={string}
      components={{ ct: <ColorText /> }}
    />
  )
}
