import { ColorText } from '@genshin-optimizer/common/ui'
import { type DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { getDiscStat } from '@genshin-optimizer/zzz/stats'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'
export function DiscSetName({ setKey }: { setKey: DiscSetKey }) {
  return getDiscStat(setKey).name ?? 'Unknown Disc Set Name'
  // TODO: Translation
  // return <Translate ns="discNames_gen" key18={setKey} />
}
export function DiscSet2p({ setKey }: { setKey: DiscSetKey }) {
  return <TransHack text={getDiscStat(setKey).desc2 ?? 'Unknown Disc Set 2p'} />
}

export function DiscSet4p({ setKey }: { setKey: DiscSetKey }) {
  return <TransHack text={getDiscStat(setKey).desc4 ?? 'Unknown Disc Set 4p'} />
}

/**
 * Quick and dirty color interpolation using Trans's component feature
 */
function TransHack({ text }: { text: string }) {
  const string = useMemo(
    () =>
      text.replaceAll('<color=', '<ct color=').replaceAll('</color>', '</ct>'),
    [text]
  )
  return (
    <Trans
      i18nKey={'invalid'}
      defaults={string}
      components={{ ct: <ColorText /> }}
    />
  )
}
