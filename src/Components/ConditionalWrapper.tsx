import { ReactNode } from "react";

type Prop = {
  condition: boolean,
  wrapper: (children: ReactNode) => ReactNode
  children: ReactNode
}
// Wrap children with element provided by wrapper func when condition is true.
export default function ConditionalWrapper({ condition, wrapper, children }: Prop) {
  return (condition ? wrapper(children) : children) as JSX.Element;
}