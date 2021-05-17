import { Trans, useTranslation } from "react-i18next"

export function Translate({ ns, key18 }: { ns: string, key18: string }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  const textObj = t(textKey, { returnObjects: true }) as any
  if (typeof textObj === "string") return <Trans i18nKey={textKey} t={t} components={components} />
  return <T key18={textKey} obj={textObj} t={t} />
}
function Para({ children }: { children?: JSX.Element }) {
  return <p className="mb-0">{children}</p>
}
const components = {
  geo: <span className="text-geo" />,
  cryo: <span className="text-cryo" />
}
function T({ key18, obj, li, t }: { key18: string, obj: any, li?: boolean, t }) {
  if (typeof obj === "string") return <Trans i18nKey={key18} components={components} parent={Para} t={t} />
  if (Array.isArray(obj))
    return <ul className="mb-2">
      <T key18={key18} obj={{ ...obj }} li t={t} />
    </ul>
  return Object.entries(obj).map(([key, val]) => {
    if (val === "<br/>") return <div key={key as any} className="mb-2" />

    if (typeof val === "object") return <T key={key as any} key18={`${key18}.${key as any}`} obj={val} t={t} />
    if (typeof val === "string") {
      const trans = <Trans key={key as any} i18nKey={`${key18}.${key}`} components={components} parent={Para} t={t} />
      return li ? <li key={key as any}>{trans}</li> : trans
    }
    return null
  }) as any
}