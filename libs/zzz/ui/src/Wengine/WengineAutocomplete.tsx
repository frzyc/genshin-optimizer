import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete, ImgIcon } from '@genshin-optimizer/common/ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import type { AutocompleteProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'

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
        label: 'Select a Wengine', //t('inventory') // TODO: Translation
      },
      ...allWengineKeys.map(
        (key): GeneralAutocompleteOption<WengineKey | ''> => ({
          key,
          label: getWengineStat(key).name, //t(`charNames_gen:${key}`)
        })
      ),
    ],
    []
  )
  const toImg = useCallback(
    (key: WengineKey | '') =>
      !key ? undefined : (
        <ImgIcon
          size={2}
          sx={{ width: 'auto' }}
          src={wengineAsset(key, 'icon')}
        />
      ),
    []
  )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        options={options}
        toImg={toImg}
        valueKey={wkey}
        onChange={(k) => setWKey(k ?? '')}
        {...props}
      />
    </Suspense>
  )
}
