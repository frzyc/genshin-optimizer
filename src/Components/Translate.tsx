import { Trans, useTranslation } from "react-i18next"

export function Translate({ ns, key18 }: { ns: string, key18: string }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  const textObj = t(textKey, { returnObjects: true }) as any
  return <T key18={textKey} obj={textObj} />
}
function Para({ children }: { children?: JSX.Element }) {
  return <p className="mb-0">{children}</p>
}
const components = {
  geo: <span className="text-geo" />
}
function T({ key18, obj, li }: { key18: string, obj: any, li?: boolean }) {
  if (typeof obj === "string") return <Trans i18nKey={key18} components={components} parent={Para} />
  if (Array.isArray(obj))
    return <ul className="mb-2">
      <T key18={key18} obj={{ ...obj }} li />
    </ul>
  return Object.entries(obj).map(([key, val]) => {
    if (val === "<br/>") return <div key={key as any} className="mb-2" />

    if (typeof val === "object") return <T key={key as any} key18={`${key18}.${key as any}`} obj={val} />
    if (typeof val === "string") {
      const trans = <Trans key={key as any} i18nKey={`${key18}.${key}`} components={components} parent={Para} />
      return li ? <li key={key as any}>{trans}</li> : trans
    }
    return null
  }) as any
}