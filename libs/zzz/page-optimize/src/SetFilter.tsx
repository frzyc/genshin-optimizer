import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { toggleInArr } from '@genshin-optimizer/common/util'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscSetName } from '@genshin-optimizer/zzz/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material'
import { useCharacterContext } from './CharacterContext'

export function SetFilter({ disabled = false }: { disabled?: boolean }) {
  const { database } = useDatabaseContext()
  const [open, onOpen, onClose] = useBoolState()
  const character = useCharacterContext()
  const {
    setFilter2 = [],
    setFilter4 = [],
    key: characterKey,
  } = character ?? {}
  return (
    <CardThemed bgt="light">
      <ModalWrapper open={open} onClose={onClose}>
        <AdvSetFilterCard onClose={onClose} />
      </ModalWrapper>
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{ flexGrow: 1, display: 'flex', gap: 1, flexDirection: 'column' }}
        >
          {setFilter4.length <= 1 ? (
            <DropdownButton
              disabled={disabled}
              title={
                setFilter4[0] ? (
                  <span>
                    Force 4-Set:{' '}
                    <strong>
                      <DiscSetName setKey={setFilter4[0]} />
                    </strong>
                  </span>
                ) : (
                  'Select to force 4-Set'
                )
              }
              sx={{ flexGrow: 1 }}
            >
              <MenuItem
                onClick={() =>
                  characterKey &&
                  database.chars.set(characterKey, {
                    setFilter4: [],
                  })
                }
              >
                No 4-Set
              </MenuItem>

              {allDiscSetKeys.map((d) => (
                <MenuItem
                  key={d}
                  onClick={() =>
                    characterKey &&
                    database.chars.set(characterKey, {
                      setFilter4: [d],
                    })
                  }
                >
                  <DiscSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Typography>{setFilter4.length} Disc Set 4p selected</Typography>
          )}

          {setFilter2.length <= 1 ? (
            <DropdownButton
              disabled={disabled}
              title={
                setFilter2[0] ? (
                  <span>
                    Force 2-Set:{' '}
                    <strong>
                      <DiscSetName setKey={setFilter2[0]} />
                    </strong>
                  </span>
                ) : (
                  'Select to force 2-Set'
                )
              }
              sx={{ flexGrow: 1 }}
            >
              <MenuItem
                onClick={() =>
                  characterKey &&
                  database.chars.set(characterKey, {
                    setFilter2: [],
                  })
                }
              >
                No 2-Set
              </MenuItem>

              {allDiscSetKeys.map((d) => (
                <MenuItem
                  key={d}
                  onClick={() =>
                    characterKey &&
                    database.chars.set(characterKey, {
                      setFilter2: [d],
                    })
                  }
                >
                  <DiscSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Typography>{setFilter2.length} Disc Set 2p selected</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          <Button disabled={disabled} onClick={onOpen} color="info">
            Advanced Set-Filter Config
          </Button>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
function AdvSetFilterCard({ onClose }: { onClose: () => void }) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()
  const {
    setFilter2 = [],
    setFilter4 = [],
    key: characterKey,
  } = character ?? {}
  return (
    <CardThemed>
      <CardHeader
        title="Advanced Set-Filter Config"
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            disabled={!setFilter4.length}
            onClick={() =>
              characterKey &&
              database.chars.set(characterKey, { setFilter4: [] })
            }
          >
            Reset 4p filter
          </Button>
          <Button
            disabled={!setFilter2.length}
            onClick={() =>
              characterKey &&
              database.chars.set(characterKey, { setFilter2: [] })
            }
          >
            Reset 2p filter
          </Button>
        </Box>
        <Grid container spacing={1}>
          {allDiscSetKeys.map((d) => (
            <Grid item key={d} xs={1} md={2} lg={3}>
              <AdvSetFilterDiscCard setKey={d} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
function AdvSetFilterDiscCard({ setKey }: { setKey: DiscSetKey }) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()
  const {
    setFilter2 = [],
    setFilter4 = [],
    key: characterKey,
  } = character ?? {}
  return (
    <CardThemed bgt="light">
      <CardHeader title={<DiscSetName setKey={setKey} />} />
      <ButtonGroup fullWidth>
        <Button
          color={
            !setFilter4.length || setFilter4.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            characterKey &&
            database.chars.set(characterKey, {
              setFilter4: setFilter4.length
                ? toggleInArr([...setFilter4], setKey)
                : [setKey],
            })
          }
        >
          Allow 4p
        </Button>
        <Button
          color={
            !setFilter2.length || setFilter2.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            characterKey &&
            database.chars.set(characterKey, {
              setFilter2: setFilter2.length
                ? toggleInArr([...setFilter2], setKey)
                : [setKey],
            })
          }
        >
          Allow 2p
        </Button>
      </ButtonGroup>
    </CardThemed>
  )
}
