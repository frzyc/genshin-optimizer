import { Alert, Button, Card, Container, Form, InputGroup, Toast } from "react-bootstrap";
import { Redirect, useLocation } from "react-router-dom";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import { CurrentDatabaseVersion, DatabaseInitAndVerify } from '../Database/DatabaseUtil';
import '../StatDependency'
import urlon from 'urlon'
import { createFlexObj, parseFlexObj } from "../Util/FlexUtil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function TestDisplay() {
  const location = useLocation()
  const searchStr = location.search
  if (searchStr) {
    const character = parseFlexObj(urlon.parse(searchStr.substring(1)))
    return <Display character={character} />
  } else {
    const characterKey = location.characterKey
    if (!characterKey) return <Redirect to={`/`} />
    DatabaseInitAndVerify()
    const flexObj = createFlexObj(characterKey)
    if (!flexObj) return <Redirect to={`/`} />
    window.scrollTo(0, 0)//sometimes the window isnt scolled to the top on redirect.
    return <Redirect to={`/flex?${urlon.stringify(flexObj)}`} />
  }
}
function Display({ character }) {
  const [toast, settoast] = useState(false)
  const url = window.location.href
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    settoast(true)
  }
  const { databaseVersion = 0 } = character
  const isUpToDate = databaseVersion < CurrentDatabaseVersion
  return <Container className="my-2">
    <Toast onClose={() => settoast(false)} show={toast} delay={3000} autohide style={{
      position: 'absolute',
      top: 50,
      right: 50,
    }}>
      <Toast.Header><b className="mr-auto">Genshin Optimizer</b></Toast.Header>
      <Toast.Body>URL copied to clipboard.</Toast.Body>
    </Toast>
    <Card bg="darkcontent" text="lightfont" className="mb-2">
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
    <CharacterDisplayCard character={character} />
  </Container>
}