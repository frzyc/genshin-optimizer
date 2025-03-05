import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { toggleInArr } from '@genshin-optimizer/common/util'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
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
} from '@mui/material'
import { DiscSetName } from './DiscTrans'

export function DiscSetFilter({
  disabled = false,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  disabled?: boolean
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
  const [open, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <ModalWrapper open={open} onClose={onClose}>
        <AdvSetFilterCard
          onClose={onClose}
          setFilter2={setFilter2}
          setFilter4={setFilter4}
          setSetFilter2={setSetFilter2}
          setSetFilter4={setSetFilter4}
        />
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
              <MenuItem onClick={() => setSetFilter4([])}>No 4-Set</MenuItem>

              {allDiscSetKeys.map((d) => (
                <MenuItem key={d} onClick={() => setSetFilter4([d])}>
                  <DiscSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Button disabled>
              <span>
                <strong>{setFilter4.length}</strong> Disc 4p-set Selected
              </span>
            </Button>
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
              <MenuItem onClick={() => setSetFilter2([])}>No 2-Set</MenuItem>

              {allDiscSetKeys.map((d) => (
                <MenuItem key={d} onClick={() => setSetFilter2([d])}>
                  <DiscSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Button disabled>
              <span>
                <strong>{setFilter2.length}</strong> Disc 2p-set Selected
              </span>
            </Button>
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
function AdvSetFilterCard({
  onClose,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  onClose: () => void
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
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
            onClick={() => setSetFilter4([])}
          >
            Reset 4p filter
          </Button>
          <Button
            disabled={!setFilter2.length}
            onClick={() => setSetFilter2([])}
          >
            Reset 2p filter
          </Button>
        </Box>
        <Grid container spacing={1}>
          {allDiscSetKeys.map((d) => (
            <Grid item key={d} xs={1} md={2} lg={3}>
              <AdvSetFilterDiscCard
                setKey={d}
                setFilter4={setFilter4}
                setFilter2={setFilter2}
                setSetFilter4={setSetFilter4}
                setSetFilter2={setSetFilter2}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
function AdvSetFilterDiscCard({
  setKey,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  setKey: DiscSetKey
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      <ButtonGroup fullWidth>
        <Button
          color={
            !setFilter4.length || setFilter4.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter4(
              setFilter4.length
                ? toggleInArr([...setFilter4], setKey)
                : [setKey]
            )
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
            setSetFilter2(
              setFilter2.length
                ? toggleInArr([...setFilter2], setKey)
                : [setKey]
            )
          }
        >
          Allow 2p
        </Button>
      </ButtonGroup>
    </CardThemed>
  )
}
