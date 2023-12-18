export const fallbackLng = 'en'
export const languages = [
  fallbackLng,
  'chs',
  'cht',
  'de',
  'es',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'th',
  'tr',
  'vi',
]
export const defaultNS = 'ui'
export const cookieName = 'i18next'
export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}
