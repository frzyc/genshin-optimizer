import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
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
  Checkbox,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEventHandler } from 'react'
import { memo, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EquipRow } from '../BuildsDisplay'
import { useTeamContext, useTeammateContext } from '../context'
import { OptConfigContext } from './OptConfigWrapper'

function useGeneratedBuildList(listId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.generatedBuildList, listId)
}
/**
 * A UI component that renders a list of generated builds
 */
const GeneratedBuildsDisplay = memo(function GeneratedBuildsDisplay() {
  const { optConfig } = useContext(OptConfigContext)
  const generatedBuildList = useGeneratedBuildList(
    optConfig.generatedBuildListId ?? ''
  )
  return (
    <Stack spacing={1}>
      {generatedBuildList?.builds.map((build, i) => (
        <CardThemed
          key={`${build.lightConeId}-${Object.values(build.relicIds).join(
            '-'
          )}`}
        >
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
            <EquipRow
              relicIds={build.relicIds}
              lightConeId={build.lightConeId}
            />
          </CardContent>
        </CardThemed>
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

function NewBuildButton({
  build: { relicIds, lightConeId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')
  const [name, setName] = useState('')
  const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()
  const [toTCBuild, setToTCBuild] = useState(false)

  const { database } = useDatabaseContext()
  const { teamId } = useTeamContext()
  const { characterKey } = useTeammateContext()
  const toNewBuild: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    if (toTCBuild) {
      // TODO: to TC build
    } else
      database.builds.new({
        characterKey,
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
        {t('createBuildReal.button')}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      <ModalWrapper
        open={showPrompt}
        onClose={OnHidePrompt}
        disableRestoreFocus
      >
        <CardThemed>
          <CardHeader
            title={t('createBuildReal.title')}
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
            <Typography>{t('createBuildReal.desc')}</Typography>
            <Box display="flex" alignItems="center" sx={{ ml: -1 }}>
              <Checkbox
                size="small"
                checked={toTCBuild}
                onChange={() => setToTCBuild(!toTCBuild)}
              />
              {/* TODO: Translate */}
              <Typography>Create a new TC Build</Typography>
            </Box>

            <form onSubmit={toNewBuild}>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                margin="dense"
                label={t('createBuildReal.label')}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={OnHidePrompt}>
                  {t('createBuildReal.cancel')}
                </Button>
                <Button type="submit" color="success" disabled={!name}>
                  {t('createBuildReal.create')}
                </Button>
              </Box>
            </form>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
