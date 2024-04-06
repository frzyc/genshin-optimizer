import { DropdownButton } from '@genshin-optimizer/common/ui'
import { languageCodeList } from '@genshin-optimizer/gi/i18n'
import { MenuItem } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

const nativeLanguages = {
  chs: '简体中文',
  cht: '繁體中文',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  ru: 'Русский язык',
  th: 'ภาษาไทย',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
}
export default function LanguageCard() {
  const { t, i18n } = useTranslation(['ui', 'settings'])
  const onSetLanguage = (lang) => () => i18n.changeLanguage(lang)
  const currentLang = i18n.languages[0]
  return (
    <DropdownButton
      fullWidth
      title={t('settings:languageCard.languageFormat', {
        language: t(`languages:${currentLang}`),
      })}
    >
      {languageCodeList.map((lang) => (
        <MenuItem
          key={lang}
          selected={currentLang === lang}
          disabled={currentLang === lang}
          onClick={onSetLanguage(lang)}
        >
          <Trans i18nKey={`languages:${lang}`} />
          {lang !== currentLang ? ` (${nativeLanguages[lang]})` : ''}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
