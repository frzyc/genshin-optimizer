import type { DotProps } from 'recharts'
import type EnhancedPoint from './EnhancedPoint'

type CustomShapeType = 'circle' | 'diamond' | 'square'
type CustomDotProps = DotProps & {
  selectedPoint: EnhancedPoint | undefined
  payload?: EnhancedPoint
  radiusSelected?: number
  radiusUnselected?: number
  colorSelected?: string
  colorUnselected: string
  shape?: CustomShapeType
}
export default function CustomDot({
  cx,
  cy,
  payload,
  selectedPoint,
  radiusSelected = 6,
  radiusUnselected = 3,
  colorSelected = 'red',
  colorUnselected,
  shape = 'circle',
}: CustomDotProps) {
  if (!cx || !cy || !payload) {
    return null
  }

  const isSelected =
    selectedPoint &&
    selectedPoint.x === payload.x &&
    selectedPoint.y === payload.y

  return (
    <g
      className="custom-dot"
      data-chart-x={cx}
      data-chart-y={cy}
      data-x-value={payload.x}
      data-y-value={payload.y}
      data-radius={isSelected ? radiusUnselected : radiusSelected}
    >
      {!isSelected ? (
        <CustomShape
          id="customShapeUnselected"
          shape={shape}
          cx={cx}
          cy={cy}
          r={radiusUnselected}
          fill={colorUnselected}
        />
      ) : (
        <>
          <CustomShape
            id="customShapeSelected"
            shape={shape}
            cx={cx}
            cy={cy}
            r={radiusSelected / 2}
            fill={colorSelected}
          />
          <CustomShape
            id="customShapeBorder"
            shape={shape}
            cx={cx}
            cy={cy}
            r={radiusSelected}
            fill="none"
            stroke={colorSelected}
          />
        </>
      )}
    </g>
  )
}
function CustomShape({
  shape,
  id,
  cx,
  cy,
  r,
  fill,
  stroke,
}: {
  shape: CustomShapeType
  id?: string
  cx: number
  cy: number
  r: number
  fill?: string
  stroke?: string
}) {
  switch (shape) {
    case 'circle':
      return (
        <circle id={id} cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} />
      )
    case 'square':
      return (
        <rect
          id={id}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          fill={fill}
          stroke={stroke}
        />
      )
    case 'diamond':
      return (
        <polygon
          id={id}
          points={`${cx},${cy + r * 2.5} ${cx + r * 1.5},${cy} ${cx},${
            cy - r * 2.5
          } ${cx - r * 1.5},${cy}`}
          fill={fill}
          stroke={stroke}
        />
      )
  }
}
