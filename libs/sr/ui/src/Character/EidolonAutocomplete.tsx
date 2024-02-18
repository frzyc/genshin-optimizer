import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { EidolonKey } from '@genshin-optimizer/sr/consts'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'

type EidolonAutocompleteProps = {
  eidolonKey: EidolonKey
  setEidolonKey: (v: EidolonKey) => void
}
export function EidolonAutocomplete({
  eidolonKey,
  setEidolonKey,
}: EidolonAutocompleteProps) {
  const options: GeneralAutocompleteOption<string>[] = useMemo(
    () =>
      [...Array(7).keys()].map((key): GeneralAutocompleteOption<string> => {
        return {
          key: key.toString(),
          label: key.toString(),
        }
      }),
    []
  )

  const setEidolon = useCallback(
    (eidolonKey: string) => {
      const eidolon = parseInt(eidolonKey)
      if (isNaN(eidolon) || eidolon < 0 || eidolon > 6) return
      setEidolonKey(eidolon as EidolonKey)
    },
    [setEidolonKey]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        options={options}
        toImg={() => <> </>} // TODO
        valueKey={eidolonKey.toString()}
        onChange={(k) => setEidolon(k ?? '')}
        label="Eidolon"
      />
    </Suspense>
  )
}
