import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Probably a way to auto-populate this.
export const languageCodeList = [
  "chs",
  "cht",
  "de",
  "en",
  "es",
  "fr",
  "id",
  "ja",
  "ko",
  "pt",
  "ru",
  "th",
  "vi"
];

/**
 * @see: https://www.i18next.com/translation-function/essentials
 * @see: https://react.i18next.com/latest/using-with-hooks
 */
i18n
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
  .init({
    // debug: process.env.NODE_ENV === "development",
    // Use English strings by default, if the current language does not include
    // the specified string.
    fallbackLng: 'en',
    // fallbackLng: 'dev', // Switch to this to force the fallback value on missing strings.

    // List all translation namespaces.
    ns: [
      "languages",
      "ui",
    ],
    // Specify the default namespace.
    defaultNS: "ui",

    // Only use the language code, skipping the region code.
    // For example, en-US becomes simply en.
    load: 'languageOnly',

    // allow an empty value to count as invalid (by default is true)
    returnEmptyString: false,

    backend: process.env.NODE_ENV === "development" ? {
      // Path to load localization data from.
      loadPath: 'genshin-optimizer/locales/{{lng}}/{{ns}}.json',
    } : {
      // Path to load localization data from.
      loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,//react does interlopation already
    }
  });

export default i18n;
