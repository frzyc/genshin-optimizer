import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import type { SvgIconProps } from '@mui/material'
import { useEffect, useState } from 'react'

export default function ElementCycle({
  iconProps,
}: {
  iconProps: SvgIconProps
}) {
  const [counter, setcounter] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setcounter((c) => c + 1), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <ElementIcon
      ele={allElementKeys[counter % allElementKeys.length]}
      iconProps={iconProps}
    />
  )
}
