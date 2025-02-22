import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete, ImgIcon } from '@genshin-optimizer/common/ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import type { AutocompleteProps } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type DiscSetAutocompleteProps = {
  discSetKey: DiscSetKey | ''
  setDiscSetKey: (key: DiscSetKey | '') => void
  label?: string
}

export function DiscSetAutocomplete({
  discSetKey,
  setDiscSetKey,
  label = '',
  ...props
}: DiscSetAutocompleteProps &
  Omit<
    AutocompleteProps<
      GeneralAutocompleteOption<DiscSetKey | ''>,
      false,
      boolean,
      false
    >,
    'options' | 'valueKey' | 'onChange' | 'toImg' | 'renderInput'
  >) {
  const { t } = useTranslation(['disc', 'discNames_gen'])
  label = label ? label : t('disc:autocompleteLabels.set')

  const toImg = useCallback(
    (key: DiscSetKey | '') =>
      key ? <ImgIcon src={discDefIcon(key)} size={1.5} /> : undefined,
    []
  )

  const options = useMemo(
    () =>
      allDiscSetKeys.map((set) => ({
        key: set,
        label: t(`discNames_gen:${set}`),
      })),
    [t]
  )

  const onChange = useCallback(
    (k: DiscSetKey | '' | null) => setDiscSetKey(k ?? ''),
    [setDiscSetKey]
  )
  return (
    <GeneralAutocomplete
      options={options}
      valueKey={discSetKey}
      onChange={onChange}
      toImg={toImg}
      label={label}
      {...props}
    />
  )
}
