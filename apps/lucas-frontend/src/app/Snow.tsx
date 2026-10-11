import { range } from '@genshin-optimizer/common/util'
import { SnowContext } from '@genshin-optimizer/gi/ui'
import { useContext } from 'react'

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
