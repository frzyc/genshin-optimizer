import { range } from '@genshin-optimizer/common/util'
import { useContext } from 'react'

import { SnowContext } from './Context/SnowContext'

export default function Snow() {
  const { snow } = useContext(SnowContext)
  if (!snow) return null
  return (
    <div id="snowflake-container">
      {range(1, 200).map((i) => (
        <div key={i} className="snowflake" />
      ))}
    </div>
  )
}
