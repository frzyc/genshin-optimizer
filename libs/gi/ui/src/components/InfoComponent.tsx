'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
import { Translate } from '@genshin-optimizer/gi/i18n'
import CloseIcon from '@mui/icons-material/Close'
import HelpIcon from '@mui/icons-material/Help'
import {
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useState } from 'react'
export function initialInfoShownState() {
  return {
    artifactPage: true,
    buildPage: true,
    characterPage: true,
  }
}
type StateInfoShown = ReturnType<typeof initialInfoShownState>
type InfoShownPageKey = keyof StateInfoShown

export function InfoComponent({
  pageKey,
  text = '',
  modalTitle = '',
  children,
}: {
  pageKey: InfoShownPageKey
  text: ReactNode
  modalTitle: ReactNode
  children: JSX.Element
}) {
  const [show, onTrue, onFalse] = useBoolState(
    typeof window !== 'undefined' &&
      localStorage.getItem(`infoShown_${pageKey}`) !== 'true',
  )

  const [displayText] = useState(
    Array.isArray(text) ? getRandomElementFromArray(text) : text,
  )
  const closeModal = useCallback(() => {
    onFalse()
    localStorage.setItem(`infoShown_${pageKey}`, 'true')
  }, [onFalse, pageKey])

  return (
    <CardThemed>
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography variant="caption" pl={1}>
            {displayText}
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Button
            size="small"
            color="info"
            variant="contained"
            onClick={onTrue}
            startIcon={<HelpIcon />}
          >
            <Translate ns="ui" key18="info" />
          </Button>
        </Grid>
      </Grid>
      <ModalWrapper
        containerProps={{ maxWidth: 'xl' }}
        open={show}
        onClose={closeModal}
      >
        <CardThemed>
          <CardContent sx={{ py: 1, display: 'flex' }}>
            <Typography variant="h6">{modalTitle}</Typography>
            <IconButton onClick={closeModal} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          </CardContent>
          <Divider />
          <CardContent>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={500} />
              }
            >
              {children}
            </Suspense>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </CardThemed>
  )
}
