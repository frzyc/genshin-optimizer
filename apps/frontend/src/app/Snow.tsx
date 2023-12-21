import { range } from '@genshin-optimizer/util'

export default function Snow() {
  return (
    <div id="snowflake-container">
      {range(1, 200).map((i) => (
        <div key={i} className="snowflake" />
      ))}
    </div>
  )
}
