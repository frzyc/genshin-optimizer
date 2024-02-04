export const langKeys = [
  'chs',
  'cht',
  'de',
  'en',
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
] as const
export type Language = (typeof langKeys)[number]
