import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function SkillSubtitle({
  talentKey,
  children,
}: {
  talentKey: 'basic' | 'skill' | 'ult' | 'talent'
  children: ReactNode
}) {
  const { t } = useTranslation('sheet_gen')
  return (
    <span>
      {t(`ability.${talentKey}`)} • {children}
    </span>
  )
}
