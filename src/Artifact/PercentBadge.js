import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class PercentBadge extends React.Component {
  getBadgeColor = (percent) => {
    let badgeColor = "secondary";
    if (percent > 70) {
      badgeColor = "success";
    } else if (percent > 40) {
      badgeColor = "warning"
    }
    return badgeColor
  }
  render() {
    const renderTooltip = (props) => (
      <Tooltip {...props}>
        {this.props.tooltip}
      </Tooltip>
    );
    let badgeColor = !this.props.valid ? "danger" : this.getBadgeColor(this.props.percent);
    if (this.props.tooltip)
      return (
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <Badge variant={badgeColor}>
            {this.props.children}
          </Badge>
        </OverlayTrigger>)
    else
      return (
        <Badge variant={badgeColor}>{this.props.children}</Badge>)
  }
}
