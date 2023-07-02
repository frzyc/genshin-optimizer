import { linspace } from './array'
describe('test @genshin_optimizer/util/array', function () {
  it('test linspace', () => {
    expect(linspace(1, 2, 3)).toEqual([1, 1.5, 2])
    expect(linspace(1, 5, 4, false)).toEqual([1, 2, 3, 4])
  })
})
