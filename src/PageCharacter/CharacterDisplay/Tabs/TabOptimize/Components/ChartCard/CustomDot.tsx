import { DotProps } from "recharts"
import { EnhancedPoint, getEnhancedPointY } from "./EnhancedPoint"

type CustomShapeType = "circle" | "diamond" | "square"
type CustomDotProps = DotProps & {
  selectedPoint: EnhancedPoint | undefined
  payload?: EnhancedPoint
  radiusSelected?: number
  radiusUnselected?: number
  colorSelected?: string
  colorUnselected: string
  shape?: CustomShapeType
}
export default function CustomDot({ cx, cy, payload, selectedPoint, radiusSelected = 6, radiusUnselected = 3, colorSelected = "red", colorUnselected, shape = "circle" }: CustomDotProps) {
  if (!cx || !cy || !payload) {
    return null
  }

  const isSelected = selectedPoint && selectedPoint.x === payload.x
    && getEnhancedPointY(selectedPoint) === getEnhancedPointY(payload)

  return (
    <g
      className="custom-dot"
      data-chart-x={cx}
      data-chart-y={cy}
      data-x-value={payload.x}
      data-y-value={getEnhancedPointY(payload)}
      data-radius={isSelected ? radiusUnselected : radiusSelected}
    >
      {!isSelected
        ? <CustomShape shape={shape} cx={cx} cy={cy} r={radiusUnselected} fill={colorUnselected} />
        : <>
          <CustomShape shape={shape} cx={cx} cy={cy} r={radiusSelected / 2} fill={colorSelected} />
          <CustomShape shape={shape} cx={cx} cy={cy} r={radiusSelected} fill="none" stroke={colorSelected} />
        </>
      }
    </g>
  )
}
function CustomShape({ shape, cx, cy, r, fill, stroke}: { shape: CustomShapeType, cx: number, cy: number, r: number, fill?: string, stroke?: string }) {
  switch(shape) {
    case "circle":
      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} />
    case "square":
      return <rect x={cx-r} y={cy-r} width={r*2} height={r*2} fill={fill} stroke={stroke} />
    case "diamond":
      return <polygon points={`${cx},${cy+r*2.5} ${cx+r*1.5},${cy} ${cx},${cy-r*2.5} ${cx-r*1.5},${cy}`} fill={fill} stroke={stroke} />
  }
}
