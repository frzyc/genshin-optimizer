import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-fs-backend'
import { initReactI18next } from 'react-i18next'

/**
 * @see: https://www.i18next.com/translation-function/essentials
 * @see: https://react.i18next.com/latest/using-with-hooks
 */
const i18nInstance = i18n
  .createInstance()
  // load translation using http ->
  // see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
// Configure localization.

i18nInstance.init({
  // debug: process.env.NODE_ENV === "development",
  // Use English strings by default, if the current language does not include
  // the specified string.
  fallbackLng: 'en',
  // fallbackLng: 'dev', // Switch to this to force the fallback value on missing strings.

  // List all translation namespaces.
  ns: ['charNames_gen', 'relicNames_gen', 'lightConeNames_gen'],
  // Specify the default namespace.
  defaultNS: 'ui',

  // Only use the language code, skipping the region code.
  // For example, en-US becomes simply en.
  load: 'languageOnly',

  returnNull: false,

  backend: {
    // Path to load localization data from.
    loadPath: `${__dirname}/assets/zzz/locales/{{lng}}/{{ns}}.json`,
  },
  interpolation: {
    escapeValue: false, //react does interlopation already
  },
})

// https://www.i18next.com/translation-function/formatting#adding-custom-format-function
i18nInstance.services.formatter?.add('percent', (value, _lng, options) => {
  return (value * 100).toFixed(options.fixed)
})
i18nInstance.services.formatter?.add('fixed', (value, _lng, options) => {
  return value.toFixed(options.fixed)
})

export { i18nInstance }
