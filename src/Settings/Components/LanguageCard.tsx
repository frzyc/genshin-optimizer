import { CardContent, Divider, MenuItem } from '@mui/material'
import { Trans, useTranslation } from "react-i18next"
import CardLight from '../../Components/Card/CardLight'
import DropdownButton from '../../Components/DropdownMenu/DropdownButton'
import SqBadge from '../../Components/SqBadge'
import { languageCodeList } from "../../i18n"
export default function LanguageCard() {
  const { t } = useTranslation();
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      {t("settings:languageCard.selectLanguage")} <SqBadge color="warning">{t("ui:underConstruction")}</SqBadge>
    </CardContent>
    <Divider />
    <CardContent>
      <LanguageDropdown />
    </CardContent>
  </CardLight>
}

const nativeLanguages = {
  "chs": "中文 正体字",
  "cht": "中文 繁體字",
  "de": "Deutsch",
  "en": "English",
  "es": "español",
  "fr": "français",
  "id": "Bahasa Indonesia",
  "ja": "日本語",
  "ko": "한국어",
  "pt": "Português",
  "ru": "Русский язык",
  "th": "ภาษาไทย",
  "vi": "Tiếng Việt"
}
export function LanguageDropdown() {
  const { t, i18n } = useTranslation(["ui", "settings"]);
  const onSetLanguage = (lang) => () => i18n.changeLanguage(lang);
  const currentLang = i18n.languages[0];
  return <DropdownButton fullWidth title={t('settings:languageCard.languageFormat', { language: t(`languages:${currentLang}`) })}>
    {languageCodeList.map((lang) => <MenuItem key={lang} selected={currentLang === lang} disabled={currentLang === lang} onClick={onSetLanguage(lang)}>
      <Trans i18nKey={`languages:${lang}`} />
      {lang !== currentLang ? ` (${nativeLanguages[lang]})` : ""}
    </MenuItem>)}
  </DropdownButton>
}