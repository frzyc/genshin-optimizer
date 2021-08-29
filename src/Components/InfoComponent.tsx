import { faQuestionCircle, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Suspense, useState } from "react"
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap"
import { dbStorage } from "../Database/DBStorage"
import { getRandomElementFromArray } from "../Util/Util"
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
  return <>
    <Modal show={showInfoModal} onHide={() => closeModal()} size="xl" variant="success" contentClassName="bg-transparent">
      <Card bg="darkcontent" text={"lightfont" as any} >
        <Card.Header>
          <Row>
            <Col>
              <Card.Title>{modalTitle}</Card.Title>
            </Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => closeModal()} >
                <FontAwesomeIcon icon={faTimes} /></Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Suspense fallback={<h3 className="text-center">Loading... <Spinner animation="border" variant="primary" /></h3>}>
            {children}
          </Suspense>
        </Card.Body>
        <Card.Footer>
          <Button variant="danger" onClick={() => closeModal()}>
            <span>Close</span>
          </Button>
        </Card.Footer>
      </Card>
    </Modal >
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Body className="pl-2 py-0 pr-0">
        <Row>
          <Col><small>{displayText}</small></Col>
          <Col xs="auto">
            <Button size="sm" variant="info" className="m-0 py-1" onClick={() => setshowInfoModal(true)}><TransWrapper ns="ui" key18="info" /> <FontAwesomeIcon icon={faQuestionCircle} /></Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </>
}