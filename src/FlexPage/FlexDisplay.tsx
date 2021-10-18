import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Button, ButtonGroup, Snackbar } from "@mui/material";
import { useCallback, useContext, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import CardDark from "../Components/Card/CardDark";
import { CustomNumberInputButtonGroupWrapper, StyledInputBase } from "../Components/CustomNumberInput";
import { DatabaseContext } from "../Database/Database";
import { exportFlex, importFlex } from "../Database/exim/flex";
import '../StatDependency';

export default function FlexDisplay() {
  const location = useLocation()
  const database = useContext(DatabaseContext)
  const searchStr = location.search
  if (searchStr) {
    const flexResult = importFlex(searchStr.substring(1))
    if (!flexResult) return <Redirect to={`/`} />
    const [database, charKey, version] = flexResult
    if (version !== 3)
      return <Redirect to={`/flex?${exportFlex(charKey, database)}`} />
    return <DatabaseContext.Provider value={database}><Display characterKey={charKey} /></DatabaseContext.Provider>
  } else {
    const characterKey = (location as any).characterKey
    if (!characterKey) return <Redirect to={`/`} />
    const flexObj = exportFlex(characterKey, database)
    if (!flexObj) return <Redirect to={`/`} />
    window.scrollTo(0, 0)//sometimes the window isnt scrolled to the top on redirect.
    return <Redirect to={`/flex?${flexObj}`} />
  }
}
function Display({ characterKey }) {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => setOpen(true), [setOpen],)
  const handleClose = useCallback(
    (event?: React.SyntheticEvent, reason?: string) => {
      if (reason === 'clickaway') return;
      setOpen(false);
    }, [setOpen])
  const copyToClipboard = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(handleClick).catch(console.error)
  }, [handleClick])
  const isUpToDate = false
  return <Box display="flex" flexDirection="column" gap={theme => theme.spacing(1)} mt={1} mb={1}>
    <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
      <Alert variant="filled" onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        URL copied to clipboard.
      </Alert>
    </Snackbar>
    <CardDark>
      <ButtonGroup sx={{ width: "100%" }}>
        <Button color="info" onClick={copyToClipboard} startIcon={<FontAwesomeIcon icon={faLink} />}>Copy URL to clipboard</Button>
        <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
          <StyledInputBase readOnly value={window.location.href} onClick={e => {
            const target = e.target as HTMLInputElement;
            target.selectionStart = 0;
            target.selectionEnd = target.value.length;
          }} sx={{ px: 2 }} />
        </CustomNumberInputButtonGroupWrapper>
      </ButtonGroup>
      {!!isUpToDate && <Alert variant="outlined" sx={{ m: 1, mt: 2 }} severity="warning" >This URL is generated on an older database version of Genshin Optimizer. The character data below might not be displayed as intended.</Alert>}
    </CardDark>
    <CharacterDisplayCard characterKey={characterKey} />
  </Box>
}