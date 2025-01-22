import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete, ImgIcon } from '@genshin-optimizer/common/ui'
import { lightConeAsset } from '@genshin-optimizer/sr/assets'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allLightConeKeys } from '@genshin-optimizer/sr/consts'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type LightConeAutocompleteProps = {
  lcKey: LightConeKey | ''
  setLCKey: (key: LightConeKey | '') => void
  label?: string
}
export function LightConeAutocomplete({
  lcKey,
  setLCKey,
  label = '',
}: LightConeAutocompleteProps) {
  const { t } = useTranslation(['lightCone', 'lightConeNames_gen'])
  label = label ? label : t('editor.lightConeName')

  const options = useMemo(
    () =>
      allLightConeKeys.map(
        (key): GeneralAutocompleteOption<LightConeKey | ''> => ({
          key,
          label: t(`lightConeNames_gen:${key}`),
        })
      ),
    [t]
  )

  const onChange = useCallback(
    (k: LightConeKey | '' | null) => setLCKey(k ?? ''),
    [setLCKey]
  )
  const toImg = useCallback(
    (key: LightConeKey | '') =>
      !key ? undefined : (
        <ImgIcon
          size={2}
          sx={{ width: 'auto' }}
          src={lightConeAsset(key, 'cover')}
        />
      ),
    []
  )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        options={options}
        valueKey={lcKey}
        onChange={onChange}
        toImg={toImg}
        label={label}
      />
    </Suspense>
  )
}
