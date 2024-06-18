'use client'

import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import initTranslations from '../i18n'

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources,
}) {
  const i18n = createInstance()

  initTranslations(locale, namespaces, i18n)

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
