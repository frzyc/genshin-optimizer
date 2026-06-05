import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { useTitle } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterSingleSelectionModal,
  openOptimizeFlow,
} from '@genshin-optimizer/gi/ui'
import { Box, Skeleton, Typography } from '@mui/material'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function OptimizeEntry() {
  const database = useDatabase()
  const navigate = useNavigate()
  const { optCharKey } = useDataEntryBase(database.dbMeta)
  const { t } = useTranslation(['charNames_gen', 'ui'])
  const [showChar, onShowChar, onHideChar] = useBoolState()

  useTitle(useMemo(() => t('ui:tabs.optimize'), [t]))

  const charCount = database.chars.keys.length
  useEffect(() => {
    const ck =
      optCharKey ?? (charCount === 1 ? database.chars.keys[0] : undefined)
    if (ck) {
      openOptimizeFlow(database, navigate, { characterKey: ck })
      return
    }
    onShowChar()
  }, [optCharKey, charCount, navigate, onShowChar, database])

  const onSelect = useCallback(
    (characterKey: CharacterKey) => {
      onHideChar()
      openOptimizeFlow(database, navigate, { characterKey })
    },
    [onHideChar, navigate, database]
  )

  return (
    <Box sx={{ p: 2 }}>
      <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
        <CharacterSingleSelectionModal
          show={showChar}
          onHide={onHideChar}
          onSelect={onSelect}
        />
      </Suspense>
      <Typography color="text.secondary">{t('ui:tabs.optimize')}…</Typography>
    </Box>
  )
}
