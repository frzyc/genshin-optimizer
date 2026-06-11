import { Alert, Snackbar } from '@mui/material'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export type DiscEditorSnackbarKind =
  | 'added'
  | 'updated'
  | 'duplicate'
  | 'removed'

type SnackbarItem = { id: number; kind: DiscEditorSnackbarKind }

type DiscEditorSnackbarContextValue = {
  pushSnackbar: (kind: DiscEditorSnackbarKind) => void
}

const DiscEditorSnackbarContext =
  createContext<DiscEditorSnackbarContextValue | null>(null)

function snackbarMessage(
  kind: DiscEditorSnackbarKind,
  t: (key: string) => string
) {
  switch (kind) {
    case 'added':
      return t('editor.discAdded')
    case 'updated':
      return t('editor.discUpdated')
    case 'duplicate':
      return t('editor.dupeDisc')
    case 'removed':
      return t('editor.discRemoved')
  }
}

function DiscEditorSnackbarStack({
  snackbars,
  onDismiss,
}: {
  snackbars: SnackbarItem[]
  onDismiss: (id: number) => void
}) {
  const { t } = useTranslation('disc')

  return (
    <>
      {snackbars.map((item, index) => (
        <Snackbar
          key={item.id}
          open
          autoHideDuration={4000}
          onClose={(_, reason) => {
            if (reason === 'clickaway') return
            onDismiss(item.id)
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ bottom: (theme) => theme.spacing(2 + index * 7) }}
        >
          <Alert
            onClose={() => onDismiss(item.id)}
            severity={item.kind === 'duplicate' ? 'warning' : 'success'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage(item.kind, t)}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export function DiscEditorSnackbarProvider({
  children,
}: {
  children: ReactNode
}) {
  const snackbarIdRef = useRef(0)
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([])

  const pushSnackbar = useCallback((kind: DiscEditorSnackbarKind) => {
    snackbarIdRef.current += 1
    setSnackbars((prev) => [...prev, { id: snackbarIdRef.current, kind }])
  }, [])

  const dismissSnackbar = useCallback((id: number) => {
    setSnackbars((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const value = useMemo(() => ({ pushSnackbar }), [pushSnackbar])

  return (
    <DiscEditorSnackbarContext.Provider value={value}>
      {children}
      <DiscEditorSnackbarStack
        snackbars={snackbars}
        onDismiss={dismissSnackbar}
      />
    </DiscEditorSnackbarContext.Provider>
  )
}

export function useDiscEditorSnackbar() {
  const ctx = useContext(DiscEditorSnackbarContext)
  if (!ctx) {
    throw new Error(
      'useDiscEditorSnackbar must be used within DiscEditorSnackbarProvider'
    )
  }
  return ctx
}
