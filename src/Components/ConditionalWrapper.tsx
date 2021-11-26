import { ReactNode } from "react";

type Prop = {
  condition: boolean,
  wrapper: (children: ReactNode) => ReactNode
  falseWrapper?: (children: ReactNode) => ReactNode
  children: ReactNode
}
// Wrap children with element provided by wrapper func when condition is true.
export default function ConditionalWrapper({ condition, wrapper, falseWrapper, children }: Prop) {
  return (condition ? wrapper(children) : (falseWrapper ? falseWrapper(children) : children)) as JSX.Element;
}