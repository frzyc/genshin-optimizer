import { useTranslation } from 'react-i18next'

export function Set2Display() {
  const { t } = useTranslation('optimize')
  return <>{t('set2')}</>
}

export function Set4Display() {
  const { t } = useTranslation('optimize')
  return <>{t('set4')}</>
}
