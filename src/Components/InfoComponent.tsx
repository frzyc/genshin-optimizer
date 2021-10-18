import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, CardContent, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { Suspense, useState } from "react"
import { dbStorage } from "../Database/DBStorage"
import { getRandomElementFromArray } from "../Util/Util"
import CardDark from "./Card/CardDark"
import CloseButton from "./CloseButton"
import ModalWrapper from "./ModalWrapper"
import { TransWrapper } from "./Translate"

export default function InfoComponent({ pageKey = "", text = "", modalTitle = "", children }: { pageKey: string, text: Displayable | Displayable[], modalTitle: Displayable, children: JSX.Element }) {
  const [showInfoModal, setshowInfoModal] = useState(dbStorage.get("infoShown")?.[pageKey] ?? true)
  const [displayText,] = useState(Array.isArray(text) ? getRandomElementFromArray(text) : text)
  const closeModal = () => {
    const infoShown = dbStorage.get("infoShown") ?? {}
    infoShown[pageKey] = false
    dbStorage.set("infoShown", infoShown)
    setshowInfoModal(false)
  }
  return <CardDark >
    <Grid container>
      <Grid item flexGrow={1}>
        <Typography variant="caption" pl={1} >
          {displayText}
        </Typography>
      </Grid>
      <Grid item xs="auto">
        <Button size="small" color="info" variant="contained" onClick={() => setshowInfoModal(true)} startIcon={<FontAwesomeIcon icon={faQuestionCircle} />}>
          <TransWrapper ns="ui" key18="info" />
        </Button>
      </Grid>
    </Grid>
    <ModalWrapper containerProps={{ maxWidth: "xl" }} open={showInfoModal} onClose={() => closeModal()} >
      <CardDark >
        <CardContent sx={{ py: 1 }}>
          <Grid container>
            <Grid item flexGrow={1}>
              <Typography variant="h6">{modalTitle}</Typography>
            </Grid>
            <Grid item>
              <CloseButton onClick={closeModal} />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardContent>
          <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={500} />}>
            {children}
          </Suspense>
        </CardContent>
        <Divider />
        <CardContent sx={{ py: 1 }}>
          <CloseButton large onClick={closeModal} />
        </CardContent>
      </CardDark>
    </ModalWrapper >
  </CardDark>
}