import { ColorText, SqBadge, TranslateBase } from '@genshin-optimizer/common/ui'
import '@genshin-optimizer/sr/theme' // import to validate typing for color variants
import type { ReactNode } from 'react'

const textComponents = {
  fire: <ColorText color="fire" />,
  ice: <ColorText color="ice" />,
  imaginary: <ColorText color="imaginary" />,
  lightning: <ColorText color="lightning" />,
  physical: <ColorText color="physical" />,
  quantum: <ColorText color="quantum" />,
  wind: <ColorText color="wind" />,
  orangeStrong: <ColorText color="orange" sx={{ fontWeight: 'bold' }} />,
}

const badgeComponents = {
  fire: <SqBadge color="fire" />,
  ice: <SqBadge color="ice" />,
  imaginary: <SqBadge color="imaginary" />,
  lightning: <SqBadge color="lightning" />,
  physical: <SqBadge color="physical" />,
  quantum: <SqBadge color="quantum" />,
  wind: <SqBadge color="wind" />,
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
