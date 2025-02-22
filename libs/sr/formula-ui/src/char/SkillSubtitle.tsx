import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function SkillSubtitle({
  talentKey,
  children,
}: {
  talentKey: 'basic' | 'skill' | 'ult' | 'talent' | 'technique'
  children: ReactNode
}) {
  const { t } = useTranslation('characters_gen')
  return (
    <span>
      {t(`ability.${talentKey}`)} • {children}
    </span>
  )
}
