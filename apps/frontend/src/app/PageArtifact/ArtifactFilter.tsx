import ReplayIcon from '@mui/icons-material/Replay'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import BlockIcon from '@mui/icons-material/Block'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { Button, CardContent, Grid, Skeleton, Typography } from "@mui/material"
import { lazy, Suspense, useCallback, useContext, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardDark from "../Components/Card/CardDark"
import SqBadge from "../Components/SqBadge"
import { DatabaseContext } from "../Database/Database"
import useDisplayArtifact from "../ReactHooks/useDisplayArtifact"
import { ICachedArtifact } from "../Types/artifact"
import { FilterOption } from "./ArtifactSort"
const ArtifactFilterDisplay = lazy(() => import('../Components/Artifact/ArtifactFilterDisplay'))

export default function ArtifactFilter({ numShowing, total, artifactIds }: { numShowing: number, total: number, artifactIds: string[] }) {
  const { t } = useTranslation(["artifact", "ui"])
  const { database } = useContext(DatabaseContext)
  const { filterOption } = useDisplayArtifact()
  const filterOptionDispatch = useCallback((option: Partial<FilterOption>) => database.displayArtifact.set({ filterOption: { ...filterOption, ...option } }), [database, filterOption])

  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
    <CardDark>
      <CardContent>
        <Grid container>
          <Grid item >
            <Typography variant="h6"><Trans t={t} i18nKey="artifactFilter">Artifact Filter</Trans></Typography>
          </Grid>
          <Grid item flexGrow={1} display="flex" justifyContent="center" alignItems="center">
            {numShowing !== total && <Typography>Filtered <strong>{numShowing}</strong> / {total}</Typography>}
          </Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => database.displayArtifact.set({ action: "reset" })} startIcon={<ReplayIcon />}>
              <Trans t={t} i18nKey="ui:reset" />
            </Button>
          </Grid>
        </Grid>
        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={200} />}>
          <ArtifactFilterDisplay filterOption={filterOption} filterOptionDispatch={filterOptionDispatch} filteredIds={artifactIds} />
        </Suspense>
      </CardContent>
    </CardDark>
  </Suspense>
}

export function ArtifactRedButtons({ artifactIds }: { artifactIds: string[] }) {
  const { t } = useTranslation(["artifact", "ui"]);
  const { database } = useContext(DatabaseContext)
  const { numDelete, numUnequip, numUnlock, numLock } = useMemo(() => {
    const artifacts = artifactIds.map(id => database.arts.get(id)) as ICachedArtifact[]
    const numUnlock = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0)
    const numLock = artifacts.length - numUnlock
    const numDelete = numUnlock
    const numUnequip = artifacts.reduce((a, art) => a + (art.location ? 1 : 0), 0)
    return { numDelete, numUnequip, numUnlock, numLock }
  }, [artifactIds, database])

  const unequipArtifacts = () =>
    window.confirm(`Are you sure you want to unequip ${numUnequip} artifacts currently equipped on characters?`) &&
    artifactIds.map(id => database.arts.set(id, { location: "" }))

  const deleteArtifacts = () =>
    window.confirm(`Are you sure you want to delete ${numDelete} artifacts?`) &&
    artifactIds.map(id => !database.arts.get(id)?.lock && database.arts.remove(id))

  const lockArtifacts = () =>
    window.confirm(`Are you sure you want to lock ${numUnlock} artifacts?`) &&
    artifactIds.map(id => database.arts.set(id, { lock: true }))

  const unlockArtifacts = () =>
    window.confirm(`Are you sure you want to unlock ${numLock} artifacts?`) &&
    artifactIds.map(id => database.arts.set(id, { lock: false }))

  return <Grid container spacing={1} alignItems="center">
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numUnequip} onClick={unequipArtifacts} startIcon={<PersonOffIcon />}>
        <Trans t={t} i18nKey="button.unequipArtifacts" >Unequip Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numUnequip ? "success" : "secondary"}>{numUnequip}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numDelete} onClick={deleteArtifacts} startIcon={<DeleteForeverIcon />}>
        <Trans t={t} i18nKey="button.deleteArtifacts" >Delete Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numDelete ? "success" : "secondary"}>{numDelete}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numLock} onClick={unlockArtifacts} startIcon={<LockOpenIcon />}>
        <Trans t={t} i18nKey="button.unlockrtifacts" >Unlock Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numLock ? "success" : "secondary"}>{numLock}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numUnlock} onClick={lockArtifacts} startIcon={<LockIcon />}>
        <Trans t={t} i18nKey="button.lockArtifacts" >Lock Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numUnlock ? "success" : "secondary"}>{numUnlock}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} display="flex" justifyContent="space-around">
      <Typography variant="caption" color="text.secondary">
        <Trans t={t} i18nKey="buttonHint">Note: the red buttons above only applies to <b>currently filtered artifacts</b></Trans>
      </Typography>
    </Grid>
  </Grid>
}
