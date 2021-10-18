import { Skeleton, Typography } from "@mui/material"
import { Suspense } from "react"
import { Trans, useTranslation } from "react-i18next"
import ColorText from "./ColoredText"
const components = {
  anemo: <ColorText color="anemo" />,
  geo: <ColorText color="geo" />,
  cryo: <ColorText color="cryo" />,
  hydro: <ColorText color="hydro" />,
  pyro: <ColorText color="pyro" />,
  electro: <ColorText color="electro" />,
}

export function Translate({ ns, key18, values, children }: { ns: string, key18: string, values?: any, children?: any }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  const textObj = values ? t(textKey, values, { returnObjects: true }) as any : t(textKey, { returnObjects: true }) as any
  if (typeof textObj === "string") return children ? <Trans i18nKey={textKey} t={t} components={components} values={values} >{children}</Trans> : <Trans i18nKey={textKey} t={t} components={components} values={values} />
  return <Suspense fallback={<Skeleton >{children}</Skeleton>}>
    <T key18={textKey} obj={textObj} t={t} values={values} />
  </Suspense>
}
/**this is used cause the `components` prop mess with tag interpolation. */
export function TransWrapper({ ns, key18, values, children }: { ns: string, key18: string, values?: any, children?: any }) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  return <Suspense fallback={<Skeleton >{children}</Skeleton>}>
    <Trans i18nKey={textKey} t={t} values={values} >{children}</Trans>
  </Suspense>

}
function Para({ children }: { children?: JSX.Element }) {
  return <Typography gutterBottom>{children}</Typography>
}

function T({ key18, obj, li, t, values }: { key18: string, obj: any, li?: boolean, t, values?: any }) {
  if (typeof obj === "string") return <Trans i18nKey={key18} components={components} parent={Para} t={t} values={values} />
  if (Array.isArray(obj))
    return <Typography component="div"><ul >
      <T key18={key18} obj={{ ...obj }} li t={t} values={values} />
    </ul></Typography>
  return Object.entries(obj).map(([key, val]) => {
    if (val === "<br/>") return null

    if (typeof val === "object") return <T key={key as any} key18={`${key18}.${key as any}`} obj={val} t={t} values={values} />
    if (typeof val === "string") {
      const trans = <Trans key={key as any} i18nKey={`${key18}.${key}`} components={components} parent={Para} t={t} values={values} />
      return li ? <li key={key as any}>{trans}</li> : trans
    }
    return null
  }) as any
}