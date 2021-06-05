import { Trans, useTranslation } from "react-i18next"
const components = {
  anemo: <span className="text-anemo" />,
  geo: <span className="text-geo" />,
  cryo: <span className="text-cryo" />,
  hydro: <span className="text-hydro" />,
  pyro: <span className="text-pyro" />,
  electro: <span className="text-electro" />,
}

export function Translate({ ns, key18, values, children }: { ns: string, key18: string, values?: any, children?: any }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  const textObj = values ? t(textKey, values, { returnObjects: true }) as any : t(textKey, { returnObjects: true }) as any
  if (typeof textObj === "string") return children ? <Trans i18nKey={textKey} t={t} components={components} values={values} >{children}</Trans> : <Trans i18nKey={textKey} t={t} components={components} values={values} />
  return <T key18={textKey} obj={textObj} t={t} values={values} />
}
/**this is used cause the `components` prop mess with tag interpolation. */
export function TransWrapper({ ns, key18, values, children }: { ns: string, key18: string, values?: any, children?: any }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  return <Trans i18nKey={textKey} t={t} values={values} >{children}</Trans>
}
function Para({ children }: { children?: JSX.Element }) {
  return <p className="mb-0">{children}</p>
}

function T({ key18, obj, li, t, values }: { key18: string, obj: any, li?: boolean, t, values?: any }) {
  if (typeof obj === "string") return <Trans i18nKey={key18} components={components} parent={Para} t={t} values={values} />
  if (Array.isArray(obj))
    return <ul className="mb-2">
      <T key18={key18} obj={{ ...obj }} li t={t} values={values} />
    </ul>
  return Object.entries(obj).map(([key, val]) => {
    if (val === "<br/>") return <div key={key as any} className="mb-2" />

    if (typeof val === "object") return <T key={key as any} key18={`${key18}.${key as any}`} obj={val} t={t} values={values} />
    if (typeof val === "string") {
      const trans = <Trans key={key as any} i18nKey={`${key18}.${key}`} components={components} parent={Para} t={t} values={values} />
      return li ? <li key={key as any}>{trans}</li> : trans
    }
    return null
  }) as any
}