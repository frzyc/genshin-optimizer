import { Masonry } from "@mui/lab"
import { CardContent, CardHeader, Divider, ListItem } from "@mui/material"
import { Box } from "@mui/system"
import { useContext, useMemo } from "react"
import CardDark from "../Card/CardDark"
import { FieldDisplayList, NodeFieldDisplay } from "../FieldDisplay"
import ImgIcon from "../Image/ImgIcon"
import { DataContext } from "../../Context/DataContext"
import { getDisplayHeader, getDisplaySections } from "../../Formula/DisplayUtil"
import { DisplaySub } from "../../Formula/type"
import { NodeDisplay } from "../../Formula/uiData"
import { customRead } from "../../Formula/utils"
import usePromise from "../../ReactHooks/usePromise"
import { objectMap } from "../../Util/Util"
import { OptimizationTargetContext } from "../../Context/OptimizationTargetContext"
import SqBadge from "../SqBadge"

export default function StatDisplayComponent() {
  const { data } = useContext(DataContext)
  const sections = getDisplaySections(data)
  return <Box sx={{ mr: -1, mb: -1 }}>
    <Masonry columns={{ xs: 1, sm: 2, md: 3, xl: 4 }} spacing={1}>
      {sections.map(([key, Nodes]) =>
        <Section key={key} displayNs={Nodes} sectionKey={key} />)}
    </Masonry >
  </Box>
}

function Section({ displayNs, sectionKey }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string }) {
  const optimizationTarget = useContext(OptimizationTargetContext)
  const { data, oldData } = useContext(DataContext)
  const header = usePromise(() => getDisplayHeader(data, sectionKey), [data, sectionKey])
  const displayNsReads = useMemo(() => objectMap(displayNs, (n, nodeKey) => customRead(["display", sectionKey, nodeKey])), [displayNs, sectionKey]);
  if (!header) return <CardDark></CardDark>

  const { title, icon, action } = header
  return <CardDark >
    <CardHeader avatar={icon && <ImgIcon size={2} sx={{ m: -1 }} src={icon} />} title={title} action={action && <SqBadge>{action}</SqBadge>} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
      <FieldDisplayList sx={{ m: 0 }}>
        {Object.entries(displayNs).map(([nodeKey, n]) =>
          <NodeFieldDisplay key={nodeKey} node={n} oldValue={oldData ? oldData.get(displayNsReads[nodeKey]!).value : undefined} component={ListItem}
            emphasize={JSON.stringify(optimizationTarget) === JSON.stringify([sectionKey, nodeKey])}
          />)}
      </FieldDisplayList>
    </CardContent>
  </CardDark>
}
