import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { valueString } from '@genshin-optimizer/common/util'
import type { GeneratedBuild } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEventHandler } from 'react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTeamContext } from '../context'
import { GeneratedBuildDisplay } from './GeneratedBuildDisplay'
import { OptConfigContext } from './OptConfigWrapper'

/**
 * A UI component that renders a list of generated builds
 */
export default function GeneratedBuildsDisplay() {
  const { optConfig } = useContext(OptConfigContext)
  return (
    <Stack spacing={1}>
      {optConfig.builds &&
        optConfig.builds.map((build, i) => (
          <CardThemed key={i}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography>
                  Build {i + 1}: {valueString(build.value)}
                </Typography>
                <NewBuildButton build={build} />
              </Box>

              <GeneratedBuildDisplay build={build.relicIds} />
            </CardContent>
          </CardThemed>
        ))}
    </Stack>
  )
}

function NewBuildButton({
  build: { relicIds, lightConeId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')
  const [name, setName] = useState('')
  const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()

  const { database } = useDatabaseContext()
  const { teamId } = useTeamContext()
  const toLoadout: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    database.builds.new({
      name,
      teamId,
      relicIds,
      lightConeId,
    })

    setName('')
    OnHidePrompt()
  }
  return (
    <>
      <Button
        color="info"
        size="small"
        startIcon={<CheckroomIcon />}
        onClick={onShowPrompt}
      >
        {t`createBuildReal.button`}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      <ModalWrapper
        open={showPrompt}
        onClose={OnHidePrompt}
        disableRestoreFocus
      >
        <CardThemed>
          <CardHeader
            title={t`createBuildReal.title`}
            action={
              <IconButton onClick={OnHidePrompt}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>{t`createBuildReal.desc`}</Typography>
            <form onSubmit={toLoadout}>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                margin="dense"
                label={t`createBuildReal.label`}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  onClick={OnHidePrompt}
                >{t`createBuildReal.cancel`}</Button>
                <Button type="submit" color="success" disabled={!name}>
                  {t`createBuildReal.create`}
                </Button>
              </Box>
            </form>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
