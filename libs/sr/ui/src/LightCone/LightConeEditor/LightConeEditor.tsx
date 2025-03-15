import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { validateLightCone } from '@genshin-optimizer/sr/db'
import { useDatabaseContext, useLightCone } from '@genshin-optimizer/sr/db-ui'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { Add, DeleteForever, Update } from '@mui/icons-material'
import { Box, Button } from '@mui/material'
import type { MouseEvent } from 'react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LightConeEditorCard } from './LightConeEditorCard'

export type LightConeEditorProps = {
  lightConeIdToEdit?: string | '' | 'new'
  cancelEdit: () => void
}

export function LightConeEditor({
  lightConeIdToEdit = '',
  cancelEdit,
}: LightConeEditorProps) {
  const { t } = useTranslation(['lightCone', 'common'])
  const { database } = useDatabaseContext()
  const dbLightCone = useLightCone(lightConeIdToEdit)
  const [lightConeState, setLightConeState] = useState<
    Partial<ILightCone> | undefined
  >(undefined)

  useEffect(() => {
    if (dbLightCone) setLightConeState(structuredClone(dbLightCone))
  }, [dbLightCone])
  useEffect(() => {
    if (lightConeIdToEdit === 'new')
      setLightConeState({
        level: 1,
        ascension: 0,
        superimpose: 1,
      })
  }, [lightConeIdToEdit])

  const update = useCallback((newValue: Partial<ILightCone>) => {
    setLightConeState((lc) => ({ ...lc, ...newValue }))
  }, [])

  const clear = useCallback(() => {
    cancelEdit()
    setLightConeState(undefined)
  }, [cancelEdit])

  const onClose = useCallback(
    (e: MouseEvent) => {
      if (
        lightConeState?.key &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      clear()
    },
    [t, lightConeState, clear],
  )

  const validatedLightcone = useMemo(
    () => validateLightCone(lightConeState),
    [lightConeState],
  )

  const footer = useMemo(
    () => (
      <Box display="flex" gap={2}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            validatedLightcone && database.lightCones.new(validatedLightcone)
            clear()
          }}
          disabled={!validatedLightcone}
          color="primary"
        >
          {t('editor.btnAdd')}
        </Button>
        {validatedLightcone && dbLightCone && (
          <Button
            startIcon={<Update />}
            onClick={() => {
              validatedLightcone &&
                database.lightCones.set(dbLightCone.id, validatedLightcone)
              clear()
            }}
            disabled={!validatedLightcone}
            color="success"
          >
            {t('editor.btnUpdate')}
          </Button>
        )}
        {!!dbLightCone?.id && (
          <Button
            startIcon={<DeleteForever />}
            onClick={() => {
              if (!window.confirm(t('editor.confirmDelete'))) return
              database.lightCones.remove(dbLightCone.id)
              clear()
            }}
            disabled={!dbLightCone?.id}
            color="error"
            sx={{ top: '2px' }}
          >
            {t('common:delete')}
          </Button>
        )}
      </Box>
    ),
    [clear, database, dbLightCone, t, validatedLightcone],
  )

  return (
    <Suspense fallback={false}>
      {lightConeState && (
        <ModalWrapper open={!!lightConeState} onClose={onClose}>
          <LightConeEditorCard
            onClose={onClose}
            lightCone={lightConeState}
            setLightCone={update}
            footer={footer}
          />
        </ModalWrapper>
      )}
    </Suspense>
  )
}
