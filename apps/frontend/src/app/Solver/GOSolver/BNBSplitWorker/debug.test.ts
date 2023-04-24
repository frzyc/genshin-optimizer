import { formula, arts } from './debugdata'
import { polyUB } from './polyUB'

test('debug', () => {
  const n = [formula]
  const poly = polyUB(n, arts)

  console.log(poly[0])
})
