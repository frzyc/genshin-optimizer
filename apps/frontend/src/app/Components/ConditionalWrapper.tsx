import type { ReactNode } from 'react'

type Prop = {
  condition: boolean
  wrapper: (children: ReactNode) => ReactNode
  falseWrapper?: (children: ReactNode) => ReactNode
  children: ReactNode
}
// Wrap children with element provided by wrapper func when condition is true.
/**
 * @deprecated use `ConditionalWrapper` in `@genshin-optimizer/ui-common`
 */
export default function ConditionalWrapper({
  condition,
  wrapper,
  falseWrapper,
  children,
}: Prop) {
  return (
    condition
      ? wrapper(children)
      : falseWrapper
      ? falseWrapper(children)
      : children
  ) as JSX.Element
}
