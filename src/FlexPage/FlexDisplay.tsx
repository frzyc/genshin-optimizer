import { Alert, Button, Card, Container, Form, InputGroup, Toast } from "react-bootstrap";
import { Redirect, useLocation } from "react-router-dom";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import '../StatDependency'
import { createFlexObj, parseFlexObj } from "./FlexUtil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function FlexDisplay() {
  const location = useLocation()
  const database = useContext(DatabaseContext)
  const searchStr = location.search
  if (searchStr) {
    const flexResult = parseFlexObj(searchStr.substring(1))
    if (!flexResult) return <Redirect to={`/`} />
    const [database, charKey, version] = flexResult
    if (version !== 3)
      return <Redirect to={`/flex?${createFlexObj(charKey, database)}`} />
    return <DatabaseContext.Provider value={database}><Display characterKey={charKey} /></DatabaseContext.Provider>
  } else {
    const characterKey = (location as any).characterKey
    if (!characterKey) return <Redirect to={`/`} />
    const flexObj = createFlexObj(characterKey, database)
    if (!flexObj) return <Redirect to={`/`} />
    window.scrollTo(0, 0)//sometimes the window isnt scrolled to the top on redirect.
    return <Redirect to={`/flex?${flexObj}`} />
  }
}
function Display({ characterKey }) {
  const [toast, settoast] = useState(false)
  const url = window.location.href
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => settoast(true)).catch(console.error)
  }
  const isUpToDate = false
  return <Container className="my-2">
    <Toast onClose={() => settoast(false)} show={toast} delay={3000} autohide style={{
      position: 'absolute',
      top: 50,
      right: 50,
    }}>
      <Toast.Header><b className="mr-auto">Genshin Optimizer</b></Toast.Header>
      <Toast.Body>URL copied to clipboard.</Toast.Body>
    </Toast>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
      <Card.Body className="p-2">
        <InputGroup className="mb-0">
          <InputGroup.Prepend>
            <Button onClick={copyToClipboard}>
              <span><FontAwesomeIcon icon={faLink} /> Copy URL to clipboard</span>
            </Button>
          </InputGroup.Prepend>
          <Form.Control readOnly value={window.location.href} onClick={e => e.target.select()} />
        </InputGroup>
        {isUpToDate && <Alert variant="warning" className="py-2 mt-2 mb-0">This URL is generated on an older database version of Genshin Optimizer. The character data below might not be displayed as intended.</Alert>}
      </Card.Body>
    </Card>
    <CharacterDisplayCard characterKey={characterKey} />
  </Container>
}