import type { ReactNode } from 'react'

export function SuperImposeWrapper({
  children,
}: {
  children: (superimpose: number) => ReactNode
}) {
  // const calc = useSrCalcContext()

  // TODO: FIXME: a character without a lightcone will cause an error
  const superimpose = 1 // calc?.compute(own.lightCone.superimpose).val ?? 1
  return children(superimpose)
}
