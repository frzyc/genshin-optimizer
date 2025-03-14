import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { toggleInArr } from '@genshin-optimizer/common/util'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type {
  RelicCavernSetKey,
  RelicPlanarSetKey,
} from '@genshin-optimizer/sr/consts'
import {
  allRelicCavernSetKeys,
  allRelicPlanarSetKeys,
} from '@genshin-optimizer/sr/consts'
import { RelicSetName } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
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

export function RelicSetFilter({
  disabled = false,
  setFilter4Cavern,
  setFilter2Cavern,
  setFilter2Planar,
  setSetFilter4Cavern,
  setSetFilter2Cavern,
  setSetFilter2Planar,
}: {
  disabled?: boolean
  setFilter4Cavern: RelicCavernSetKey[]
  setFilter2Cavern: RelicCavernSetKey[]
  setFilter2Planar: RelicPlanarSetKey[]
  setSetFilter4Cavern: (setFilter4Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Cavern: (setFilter2Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Planar: (setFilter2Planar: RelicPlanarSetKey[]) => void
}) {
  const [open, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <ModalWrapper open={open} onClose={onClose}>
        <AdvSetFilterCard
          onClose={onClose}
          setFilter2Cavern={setFilter2Cavern}
          setFilter4Cavern={setFilter4Cavern}
          setFilter2Planar={setFilter2Planar}
          setSetFilter2Cavern={setSetFilter2Cavern}
          setSetFilter4Cavern={setSetFilter4Cavern}
          setSetFilter2Planar={setSetFilter2Planar}
        />
      </ModalWrapper>
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{ flexGrow: 1, display: 'flex', gap: 1, flexDirection: 'column' }}
        >
          {setFilter4Cavern.length <= 1 ? (
            <DropdownButton
              disabled={disabled}
              title={
                setFilter4Cavern[0] ? (
                  <span>
                    Force 4-Set:{' '}
                    <strong>
                      <RelicSetName setKey={setFilter4Cavern[0]} />
                    </strong>
                  </span>
                ) : (
                  'Select to force 4-Set'
                )
              }
              sx={{ flexGrow: 1 }}
            >
              <MenuItem onClick={() => setSetFilter4Cavern([])}>
                No 4-Set
              </MenuItem>

              {allRelicCavernSetKeys.map((d) => (
                <MenuItem key={d} onClick={() => setSetFilter4Cavern([d])}>
                  <RelicSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Button disabled>
              <span>
                <strong>{setFilter4Cavern.length}</strong> Relic 4p-set Selected
              </span>
            </Button>
          )}

          {setFilter2Cavern.length <= 1 ? (
            <DropdownButton
              disabled={disabled}
              title={
                setFilter2Cavern[0] ? (
                  <span>
                    Force 2-Set:{' '}
                    <strong>
                      <RelicSetName setKey={setFilter2Cavern[0]} />
                    </strong>
                  </span>
                ) : (
                  'Select to force 2-Set'
                )
              }
              sx={{ flexGrow: 1 }}
            >
              <MenuItem onClick={() => setSetFilter2Cavern([])}>
                No 2-Set
              </MenuItem>

              {allRelicCavernSetKeys.map((d) => (
                <MenuItem key={d} onClick={() => setSetFilter2Cavern([d])}>
                  <RelicSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Button disabled>
              <span>
                <strong>{setFilter2Cavern.length}</strong> Relic Cavern 2p-set
                Selected
              </span>
            </Button>
          )}
          {setFilter2Planar.length <= 1 ? (
            <DropdownButton
              disabled={disabled}
              title={
                setFilter2Planar[0] ? (
                  <span>
                    Force 2-Set:{' '}
                    <strong>
                      <RelicSetName setKey={setFilter2Planar[0]} />
                    </strong>
                  </span>
                ) : (
                  'Select to force 2-Set'
                )
              }
              sx={{ flexGrow: 1 }}
            >
              <MenuItem onClick={() => setSetFilter2Planar([])}>
                No 2-Set
              </MenuItem>

              {allRelicPlanarSetKeys.map((d) => (
                <MenuItem key={d} onClick={() => setSetFilter2Planar([d])}>
                  <RelicSetName setKey={d} />
                </MenuItem>
              ))}
            </DropdownButton>
          ) : (
            <Button disabled>
              <span>
                <strong>{setFilter2Planar.length}</strong> Relic Planar 2p-set
                Selected
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
  setFilter4Cavern,
  setFilter2Cavern,
  setFilter2Planar,
  setSetFilter4Cavern,
  setSetFilter2Cavern,
  setSetFilter2Planar,
}: {
  onClose: () => void
  setFilter4Cavern: RelicCavernSetKey[]
  setFilter2Cavern: RelicCavernSetKey[]
  setFilter2Planar: RelicPlanarSetKey[]
  setSetFilter4Cavern: (setFilter4Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Cavern: (setFilter2Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Planar: (setFilter2Planar: RelicPlanarSetKey[]) => void
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
        {/* TODO: translate */}
        <Typography variant="h6">Cavern</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            disabled={!setFilter4Cavern.length}
            onClick={() => setSetFilter4Cavern([])}
          >
            Reset 4p filter
          </Button>
          <Button
            disabled={!setFilter2Cavern.length}
            onClick={() => setSetFilter2Cavern([])}
          >
            Reset 2p filter
          </Button>
        </Box>
        <Grid container spacing={1}>
          {allRelicCavernSetKeys.map((d) => (
            <Grid item key={d} xs={1} md={2} lg={3}>
              <AdvSetFilterRelicCavernCard
                setKey={d}
                setFilter4Cavern={setFilter4Cavern}
                setFilter2Cavern={setFilter2Cavern}
                setSetFilter4Cavern={setSetFilter4Cavern}
                setSetFilter2Cavern={setSetFilter2Cavern}
              />
            </Grid>
          ))}
        </Grid>
        {/* TODO: translate */}
        <Typography variant="h6">Planar</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            disabled={!setFilter2Cavern.length}
            onClick={() => setSetFilter2Planar([])}
          >
            Reset 2p filter
          </Button>
        </Box>
        <Grid container spacing={1}>
          {allRelicPlanarSetKeys.map((d) => (
            <Grid item key={d} xs={1} md={2} lg={3}>
              <AdvSetFilterRelicPlanarCard
                setKey={d}
                setFilter2Planar={setFilter2Planar}
                setSetFilter2Planar={setSetFilter2Planar}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
function AdvSetFilterRelicCavernCard({
  setKey,
  setFilter4Cavern,
  setFilter2Cavern,
  setSetFilter4Cavern,
  setSetFilter2Cavern,
}: {
  setKey: RelicCavernSetKey
  setFilter4Cavern: RelicCavernSetKey[]
  setFilter2Cavern: RelicCavernSetKey[]
  setSetFilter4Cavern: (setFilter4Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Cavern: (setFilter2Cavern: RelicCavernSetKey[]) => void
}) {
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={<RelicSetName setKey={setKey} />}
        avatar={
          <ImgIcon
            src={relicAsset(setKey, getDefaultRelicSlot(setKey))}
            size={2}
          />
        }
      />
      <ButtonGroup fullWidth>
        <Button
          color={
            !setFilter4Cavern.length || setFilter4Cavern.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter4Cavern(
              setFilter4Cavern.length
                ? toggleInArr([...setFilter4Cavern], setKey)
                : [setKey],
            )
          }
        >
          Allow 4p
        </Button>
        <Button
          color={
            !setFilter2Cavern.length || setFilter2Cavern.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter2Cavern(
              setFilter2Cavern.length
                ? toggleInArr([...setFilter2Cavern], setKey)
                : [setKey],
            )
          }
        >
          Allow 2p
        </Button>
      </ButtonGroup>
    </CardThemed>
  )
}
function AdvSetFilterRelicPlanarCard({
  setKey,
  setFilter2Planar,
  setSetFilter2Planar,
}: {
  setKey: RelicPlanarSetKey
  setFilter2Planar: RelicPlanarSetKey[]
  setSetFilter2Planar: (setFilter2Planar: RelicPlanarSetKey[]) => void
}) {
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={<RelicSetName setKey={setKey} />}
        avatar={
          <ImgIcon
            src={relicAsset(setKey, getDefaultRelicSlot(setKey))}
            size={2}
          />
        }
      />
      <ButtonGroup fullWidth>
        <Button
          color={
            !setFilter2Planar.length || setFilter2Planar.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter2Planar(
              setFilter2Planar.length
                ? toggleInArr([...setFilter2Planar], setKey)
                : [setKey],
            )
          }
        >
          Allow 2p
        </Button>
      </ButtonGroup>
    </CardThemed>
  )
}
