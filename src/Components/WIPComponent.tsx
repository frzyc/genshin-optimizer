import { OverlayTrigger, Tooltip } from "react-bootstrap"

const WIPComponent = ({ children }) =>
  <OverlayTrigger
    overlay={<Tooltip id="wip">Work In Progress</Tooltip>}
  >
    <span>
      {children}
    </span>
  </OverlayTrigger>

export default WIPComponent