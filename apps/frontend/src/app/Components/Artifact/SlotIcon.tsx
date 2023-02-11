import { ArtifactSlotKey } from "@genshin-optimizer/consts";
import { SvgIconProps } from "@mui/material";
import CircletIcon from "../../SVGIcons/ArtifactSlot/CircletIcon";
import FlowerIcon from "../../SVGIcons/ArtifactSlot/FlowerIcon";
import GobletIcon from "../../SVGIcons/ArtifactSlot/GobletIcon";
import PlumeIcon from "../../SVGIcons/ArtifactSlot/PlumeIcon";
import SandsIcon from "../../SVGIcons/ArtifactSlot/SandsIcon";

export default function SlotIcon({ slotKey, iconProps = {} }: { slotKey: ArtifactSlotKey, iconProps?: SvgIconProps }) {
  switch (slotKey) {
    case "flower":
      return <FlowerIcon {...iconProps} />
    case "plume":
      return <PlumeIcon {...iconProps} />
    case "sands":
      return <SandsIcon {...iconProps} />
    case "goblet":
      return <GobletIcon {...iconProps} />
    case "circlet":
      return <CircletIcon {...iconProps} />
  }
}
