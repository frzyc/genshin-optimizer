import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useMemo } from 'react'

export function WengineAutocomplete({
  wkey,
  setWKey,
  ...props
}: {
  wkey: WengineKey | ''
  setWKey: (v: WengineKey | '') => void
} & Omit<
  AutocompleteProps<
    GeneralAutocompleteOption<WengineKey | ''>,
    false,
    boolean,
    false
  >,
  'options' | 'valueKey' | 'onChange' | 'toImg' | 'renderInput'
>) {
  // const { t } = useTranslation(['common', 'charNames_gen'])

  const options: GeneralAutocompleteOption<WengineKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: 'Select a Wengine', //t('inventory')
      },
      ...allWengineKeys.map(
        (key): GeneralAutocompleteOption<WengineKey | ''> => ({
          key,
          label: key, //t(`charNames_gen:${key}`)
        })
      ),
    ],
    []
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={options}
        toImg={() => <> </>} // TODO:
        valueKey={wkey}
        onChange={(k) => setWKey(k ?? '')}
        {...props}
      />
    </Suspense>
  )
}
