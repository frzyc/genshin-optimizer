'use client'
import { ColorText, SqBadge, TranslateBase } from '@genshin-optimizer/common/ui'
import '@genshin-optimizer/zzz/theme' // import to validate typing for color variants
import type { ReactNode } from 'react'

const textComponents = {
  fire: <ColorText color="fire" />,
  ice: <ColorText color="ice" />,
  electric: <ColorText color="electric" />,
  frost: <ColorText color="frost" />,
  physical: <ColorText color="physical" />,
  ether: <ColorText color="ether" />,
}

const badgeComponents = {
  fire: <SqBadge color="fire" />,
  ice: <SqBadge color="ice" />,
  electric: <SqBadge color="electric" />,
  frost: <SqBadge color="frost" />,
  physical: <SqBadge color="physical" />,
  ether: <SqBadge color="ether" />,
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
