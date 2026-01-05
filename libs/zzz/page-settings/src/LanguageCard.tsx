import { DropdownButton } from '@genshin-optimizer/common/ui'
import { languageCodeList } from '@genshin-optimizer/zzz/i18n'
import { MenuItem } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

const nativeLanguages: Record<string, string> = {
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
  const { t, i18n } = useTranslation(['page_settings', 'languages'])
  const onSetLanguage = (lang: string) => () => i18n.changeLanguage(lang)
  const currentLang = i18n.languages[0]
  return (
    <DropdownButton
      fullWidth
      title={t('page_settings:languageCard.languageFormat', {
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