import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router-dom'

export function useTitle(title?: string) {
  const { t } = useTranslation('ui')
  const match = useMatch({ path: '/:page/*' })
  const pageTitle = t('pageTitle')
  const displayTitle =
    title ?? (match?.params.page && t(`tabs.${match?.params.page}`))
  useEffect(() => {
    if (displayTitle) document.title = `${displayTitle} - ${pageTitle}`
    else document.title = pageTitle
  }, [t, pageTitle, displayTitle])
}
