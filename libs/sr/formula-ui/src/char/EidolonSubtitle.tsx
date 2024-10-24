import { useTranslation } from 'react-i18next'

export function EidolonSubtitle({ eidolon }: { eidolon: number }) {
  const { t } = useTranslation('characters_gen')
  return (
    <span>
      {t('eidolonLvl')} {eidolon}
    </span>
  )
}
