import type { EmotionJSX } from '@emotion/react/types/jsx-namespace'
import { Skeleton, Typography } from '@mui/material'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Note: Trans.values & Trans.components wont work together...
 */
export function TranslateBase({
  ns,
  key18,
  values,
  children,
  components,
}: {
  ns: string
  key18: string
  values?: Record<string, string | number>
  children?: ReactNode
  components?: Record<string, EmotionJSX.Element>
}) {
  const { t } = useTranslation(ns)
  const textKey = `${ns}:${key18}`
  const textObj = values
    ? t(textKey, { returnObjects: true, ...values })
    : t(textKey, { returnObjects: true })
  return typeof textObj === 'string' ? (
    <span>
      <Trans i18nKey={textKey} t={t} components={components} values={values}>
        {children}
      </Trans>
    </span>
  ) : (
    <Suspense fallback={<Skeleton>{children}</Skeleton>}>
      <T
        key18={textKey}
        obj={textObj}
        t={t}
        values={values}
        components={components}
      />
    </Suspense>
  )
}

function Para({ children }: { children?: JSX.Element }) {
  return <Typography gutterBottom>{children}</Typography>
}

function T({
  key18,
  obj,
  li,
  t,
  values,
  components,
}: {
  key18: string
  obj: any
  li?: boolean
  t: TFunction<string, undefined>
  values?: any
  components?: Record<string, EmotionJSX.Element>
}) {
  if (typeof obj === 'string')
    return (
      <Trans
        i18nKey={key18}
        components={components}
        parent={Para}
        t={t}
        values={values}
      />
    )
  if (Array.isArray(obj))
    return (
      <Typography component="div">
        <ul>
          <T
            key18={key18}
            obj={{ ...obj }}
            li
            t={t}
            values={values}
            components={components}
          />
        </ul>
      </Typography>
    )
  return Object.entries(obj).map(([key, val]) => {
    if (val === '<br/>') return null

    if (typeof val === 'object')
      return (
        <T
          key={key as any}
          key18={`${key18}.${key as any}`}
          obj={val}
          t={t}
          values={values}
          components={components}
        />
      )
    if (typeof val === 'string') {
      const trans = (
        <Trans
          key={key as any}
          i18nKey={`${key18}.${key}`}
          components={components}
          parent={Para}
          t={t}
          values={values}
        />
      )
      return li ? <li key={key as any}>{trans}</li> : trans
    }
    return null
  }) as any
}
