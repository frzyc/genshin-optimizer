import { linspace, range } from './array'
describe('test @genshin_optimizer/util/array', function () {
  it('test linspace', () => {
    expect(linspace(1, 2, 3)).toEqual([1, 1.5, 2])
    expect(linspace(1, 5, 4, false)).toEqual([1, 2, 3, 4])
  })
  it('test range', () => {
    expect(range(0, 0)).toEqual([0])
    expect(range(0, 10, 4)).toEqual([0, 4, 8])
  })
})
