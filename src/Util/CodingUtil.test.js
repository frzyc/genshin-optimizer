import { encode, decode } from './CodingUtil'

describe('Export Import', () => {
  test('roundtrip sparse object', () => {
    {
      let schema = {
        type: "sparse",
        keySchema: { type: "string" },
        valueSchema: { type: "uint", length: 2 },
      }
      const object = { "test": 11, "test1": 3882 }
      expect(decode(encode(object, schema), schema)).toEqual(object)
    }
    {
      let schema = {
        type: "sparse",
        keys: ["test"],
        keySchema: { type: "string" },
        valueSchema: { type: "uint", length: 2 },
      }
      const object = { "test": 11, "test1": 3882 }
      expect(decode(encode(object, schema), schema)).toEqual({ "test": 11 })
    }
  })

  test('roundtrip object', () => {
    {
      let schema = {
        type: "object",
        schemas: {
          s: { type: "string", default: "asjhd" },
          a: { type: "uint" },
        }
      }
      expect(decode(encode({ a: 1 }, schema), schema)).toEqual({ a: 1, s: "asjhd" })
    }
  })

  test('roundtrip array', () => {
    let schema = {
      type: "array",
      schemas: [
        { type: "string" },
        { type: "uint", length: 2 },
        { type: "uint" },
        { type: "fixed", list: [1, 1000000, 10000002, "Hi"] },
        { type: "array", defaultSchema: { type: "uint", defaultValue: 1 } },
      ]
    }
    let array = [
      "test", 200, 11, "Hi", [1, 2, 3, 444]
    ]
    expect(decode(encode(array, schema), schema)).toEqual(array)
  })

  test('roundtrip fixed item list', () => {
    let schema = {
      type: "fixed", length: 1,
      list: ["a", "1234", "s", "test", 1, 2, 3, 4, 5]
    }
    for (const item of schema.list) {
      expect(decode(encode(item, schema), schema)).toEqual(item)
    }
  })

  test('roundtrip string', () => {
    let schema = { type: "string" }, string = 'jajsrpotq'
    expect(decode(encode(string, schema), schema)).toEqual(string)
  })

  test('roundtrip variable-length integers', () => {
    let schema = { type: "uint" }
    for (let j = 0; j < 1000; j++) {
      expect(decode(encode(j, schema), schema)).toEqual(j)
    }
  })
})
