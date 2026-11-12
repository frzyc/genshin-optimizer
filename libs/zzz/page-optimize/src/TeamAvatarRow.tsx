import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/zzz/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

const TEAM_AVATAR_PX = 28
const EXTRA_SLOTS = [0, 1] as const

export function TeamAvatarRow({
  characterKey,
  onOpenTeamSection,
}: {
  characterKey: CharacterKey
  onOpenTeamSection: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const team = useTeam(characterKey)
  const [pickingSlot, setPickingSlot] = useState<0 | 1>()

  return (
    <>
      <Stack direction="row" spacing={0.25} alignItems="center">
        <Tooltip title={t('onField')}>
          <Box
            component="img"
            src={characterAsset(characterKey, 'circle')}
            alt=""
            sx={{
              width: TEAM_AVATAR_PX,
              height: TEAM_AVATAR_PX,
              borderRadius: '50%',
              outline: '2px solid',
              outlineColor: 'success.main',
            }}
          />
        </Tooltip>
        {EXTRA_SLOTS.map((slot) => {
          const teammateKey = team?.teammates[slot + 1]?.characterKey
          return teammateKey ? (
            <Box key={slot} sx={{ position: 'relative' }}>
              <Tooltip title={<CharacterName characterKey={teammateKey} />}>
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  onClick={onOpenTeamSection}
                >
                  <Box
                    component="img"
                    src={characterAsset(teammateKey, 'circle')}
                    alt=""
                    sx={{
                      width: TEAM_AVATAR_PX,
                      height: TEAM_AVATAR_PX,
                      borderRadius: '50%',
                    }}
                  />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                aria-label={t('removeTeammate')}
                onClick={() =>
                  database.teams.setTeammate(characterKey, null, slot)
                }
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  '& .MuiSvgIcon-root': { fontSize: 12 },
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              key={slot}
              size="small"
              aria-label={t('addTeammate', { n: slot + 1 })}
              onClick={() => setPickingSlot(slot)}
              sx={{ p: 0.25 }}
            >
              <AddIcon sx={{ fontSize: TEAM_AVATAR_PX * 0.65 }} />
            </IconButton>
          )
        })}
      </Stack>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={pickingSlot !== undefined}
          onHide={() => setPickingSlot(undefined)}
          showNone
          characterFilter={(ck) => ck !== characterKey}
          onSelect={(ck) => {
            if (pickingSlot === undefined) return
            if (ck) database.chars.getOrCreate(ck)
            database.teams.setTeammate(characterKey, ck, pickingSlot)
            setPickingSlot(undefined)
          }}
        />
      </Suspense>
    </>
  )
}
