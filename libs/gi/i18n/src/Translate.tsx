import { ColorText, SqBadge, TranslateBase } from '@genshin-optimizer/common/ui'
import '@genshin-optimizer/gi/theme' // import to validate typing for color variants
import type { ReactNode } from 'react'

const textComponents = {
  anemo: <ColorText color="anemo" />,
  geo: <ColorText color="geo" />,
  cryo: <ColorText color="cryo" />,
  hydro: <ColorText color="hydro" />,
  pyro: <ColorText color="pyro" />,
  electro: <ColorText color="electro" />,
  dendro: <ColorText color="dendro" />,
  heal: <ColorText color="heal" />,
  vaporize: <ColorText color="vaporize" />,
  spread: <ColorText color="spread" />,
  aggravate: <ColorText color="aggravate" />,
  overloaded: <ColorText color="overloaded" />,
  superconduct: <ColorText color="superconduct" />,
  electrocharged: <ColorText color="electrocharged" />,
  lunarcharged: <ColorText color="lunarcharged" />,
  lunarbloom: <ColorText color="lunarbloom" />,
  shattered: <ColorText color="shattered" />,
  bloom: <ColorText color="bloom" />,
  burgeon: <ColorText color="burgeon" />,
  hyperbloom: <ColorText color="hyperbloom" />,
  lunarcrystallize: <ColorText color="lunarcrystallize" />,
}

const badgeComponents = {
  anemo: <SqBadge color="anemo" />,
  geo: <SqBadge color="geo" />,
  cryo: <SqBadge color="cryo" />,
  hydro: <SqBadge color="hydro" />,
  pyro: <SqBadge color="pyro" />,
  electro: <SqBadge color="electro" />,
  dendro: <SqBadge color="dendro" />,
  heal: <SqBadge color="heal" />,
  vaporize: <SqBadge color="vaporize" />,
  spread: <SqBadge color="spread" />,
  aggravate: <SqBadge color="aggravate" />,
  overloaded: <SqBadge color="overloaded" />,
  superconduct: <SqBadge color="superconduct" />,
  electrocharged: <SqBadge color="electrocharged" />,
  lunarcharged: <SqBadge color="lunarcharged" />,
  lunarbloom: <SqBadge color="lunarbloom" />,
  shattered: <SqBadge color="shattered" />,
  bloom: <SqBadge color="bloom" />,
  burgeon: <SqBadge color="burgeon" />,
  hyperbloom: <SqBadge color="hyperbloom" />,
  lunarcrystallize: <SqBadge color="lunarcrystallize" />,
}

export function Translate({
  ns,
  key18,
  values,
  children,
  useBadge,
}: {
  ns: string
  key18: string
  values?: Record<string, string | number>
  children?: ReactNode
  useBadge?: boolean
}) {
  return (
    <TranslateBase
      ns={ns}
      key18={key18}
      values={values}
      children={children}
      components={useBadge ? badgeComponents : textComponents}
    />
  )
}
