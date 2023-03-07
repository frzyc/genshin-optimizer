import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function useTitle(title: string) {
  const { t } = useTranslation("ui")
  const pageTitle = t("pageTitle")
  useEffect(() => {
    if (title) document.title = `${title} - ${pageTitle}`
    else document.title = pageTitle
  }, [t, title, pageTitle])
}
