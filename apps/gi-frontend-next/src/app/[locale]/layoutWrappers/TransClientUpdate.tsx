'use client'

import { useTranslation } from '../../../i18n/client'

/**
 * This is just a client component that updates the locale of the translations. nothing is rendered
 */
export default function TransClientUpdate({ locale }: { locale: string }) {
  useTranslation(locale, ['ui'])
  return null
}
