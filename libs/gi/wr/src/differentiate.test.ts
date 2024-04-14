import { ddx } from './differentiate'
import { optimize } from './optimization'
import {
  constant,
  dynRead,
  frac,
  max,
  min,
  prod,
  sum,
  threshold,
} from './utils'

// Note/Warning: changing `optimize` implementation will break several of these tests.

describe('differentiate', () => {
  const x = dynRead('x')
  const y = dynRead('y')

  test('constant', () => {
    expect(ddx(constant(0), (n) => n.path[1], 'x')).toEqual(constant(0))
    expect(ddx(constant(15.2), (n) => n.path[1], 'x')).toEqual(constant(0))
    expect(ddx(y, (n) => n.path[1], 'x')).toEqual(constant(0))
  })

  test('linear', () => {
    expect(ddx(x, (n) => n.path[1], 'x')).toEqual(constant(1))
    const d2x = optimize(
      [ddx(prod(x, constant(2.2)), (n) => n.path[1], 'x')],
      {}
    )
    expect(d2x[0]).toEqual(constant(2.2))
    const dxy = optimize([ddx(prod(x, y), (n) => n.path[1], 'x')], {})
    expect(dxy[0]).toEqual(y)
  })

  test('polynomial', () => {
    const d2xxy = optimize(
      [ddx(prod(x, x, y, constant(2.2)), (n) => n.path[1], 'x')],
      {}
    )
    expect(d2xxy[0]).toEqual(
      sum(prod(constant(2.2), x, y), prod(constant(2.2), x, y))
    ) // 2.2xy + 2.2xy
  })

  test('sum', () => {
    const dx_xy_y = optimize(
      [ddx(sum(x, prod(x, y), y), (n) => n.path[1], 'x')],
      {}
    )
    expect(dx_xy_y[0]).toEqual(sum(constant(1), y)) // 1 + y
  })

  test('sum_frac', () => {
    const [dfrac] = optimize([ddx(frac(x, 1500), (n) => n.path[1], 'x')], {})
    // 1500 / (1500 + x)^2
    const numerator = constant(1500)
    const denom = prod(sum(1500, x), sum(1500, x))
    expect(dfrac).toEqual(frac(numerator, sum(-1500, denom)))
  })

  test('threshold', () => {
    const branch = threshold(y, 5, x, 12)
    expect(ddx(branch, (n) => n.path[1], 'x')).toEqual(threshold(y, 5, 1, 0))
  })

  test('min', () => {
    const mx3 = min(x, 3)
    expect(optimize([ddx(mx3, (n) => n.path[1], 'x')], {})[0]).toEqual(
      threshold(3, x, 1, 0)
    )

    const mx3xy = min(x, 3, prod(x, y))
    expect(optimize([ddx(mx3xy, (n) => n.path[1], 'x')], {})[0]).toEqual(
      threshold(prod(x, y), min(3, x), threshold(3, x, 1, 0), y)
    )
  })

  test('max', () => {
    const mx3 = max(x, 3)
    expect(optimize([ddx(mx3, (n) => n.path[1], 'x')], {})[0]).toEqual(
      threshold(3, x, 0, 1)
    )

    const mx3xy = max(x, 3, prod(x, y))
    expect(optimize([ddx(mx3xy, (n) => n.path[1], 'x')], {})[0]).toEqual(
      threshold(prod(x, y), max(3, x), y, threshold(3, x, 0, 1))
    )
  })
})
