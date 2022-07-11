import { Box, CardContent, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useReducer } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../../../../Assets/Assets"
import CardDark from "../../../../Components/Card/CardDark"
import CloseButton from "../../../../Components/CloseButton"
import ImgIcon from "../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../Components/ModalWrapper"
import { DatabaseContext } from "../../../../Database/Database"
import ArtifactCard from "../../../../PageArtifact/ArtifactCard"
import { artifactFilterConfigs, FilterOption, initialFilterOption } from "../../../../PageArtifact/ArtifactSort"
import useForceUpdate from "../../../../ReactHooks/useForceUpdate"
import useMediaQueryUp from "../../../../ReactHooks/useMediaQueryUp"
import { SlotKey } from "../../../../Types/consts"
import { filterFunction } from "../../../../Util/SortByFilters"
import CompareBuildButton from "./CompareBuildButton"
const numToShowMap = { xs: 6, sm: 6, md: 9, lg: 12, xl: 12 }

const ArtifactFilterDisplay = lazy(() => import('../../../../Components/Artifact/ArtifactFilterDisplay'))

export default function ArtifactSwapModal({ onChangeId, slotKey, show, onClose }:
  { onChangeId: (id: string) => void, slotKey: SlotKey, show: boolean, onClose: () => void }) {
  const { t } = useTranslation("page_character")
  const { database } = useContext(DatabaseContext)
  const clickHandler = useCallback((id) => {
    onChangeId(id)
    onClose()
  }, [onChangeId, onClose])
  const filterOptionReducer = useCallback((state, action) => ({ ...state, ...action, slotKeys: [slotKey] }), [slotKey],)

  const [filterOption, filterOptionDispatch]: [FilterOption, (action: any) => void] = useReducer(filterOptionReducer, { ...initialFilterOption(), slotKeys: [slotKey] })

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => { return database.arts.followAny(forceUpdate) }, [database, forceUpdate])

  const brPt = useMediaQueryUp()

  const filterConfigs = useMemo(() => artifactFilterConfigs(), [])
  const artIdList = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return dbDirty && database.arts.values.filter(filterFunc).map(art => art.id).slice(0, numToShowMap[brPt])
  }, [dbDirty, database, filterConfigs, filterOption, brPt])

  return <ModalWrapper open={show} onClose={onClose} containerProps={{ maxWidth: "xl" }} >
    <CardDark>
      <CardContent sx={{ py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">{slotKey ? <ImgIcon src={Assets.slot[slotKey]} /> : null} {t`tabEquip.swapArt`}</Typography>
        <CloseButton onClick={onClose} />
      </CardContent>
      <Divider />
      <CardContent>
        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={200} />}>
          <ArtifactFilterDisplay filterOption={filterOption} filterOptionDispatch={filterOptionDispatch} disableSlotFilter />
        </Suspense>
        <Box mt={1}>
          <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
            <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
              {artIdList.map(id =>
                <Grid item key={id} xs={1} >
                  <ArtifactCard
                    artifactId={id}
                    extraButtons={<CompareBuildButton artId={id} />}
                    onClick={clickHandler}
                  />
                </Grid>)}
            </Grid>
          </Suspense>
        </Box>
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
