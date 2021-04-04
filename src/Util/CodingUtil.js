/// Schema keys
/// Common {
///   encode?: A function that transform encoding object into the specified format
///   decode?: A function that transform object in the specified format into the decoded object
/// }
///
/// UInt: { type: "uint",
///   length?: number of bytes, uses variable-length format if not set,
/// }
/// String: { type: "string" }
/// Fixed: { type: "fixed",
///   list: array of permitted items,
///   length?: Same as UInt,
/// }
/// Array: { type: "array",
///   schemas?: Array of schemas, in the same order as the item,
///   defaultSchema?: Default schema for when `schemas[i]` is `null`,
/// }
/// Object: { type: "object",
///   schemas: A key-schema dictionary, some value entries may be `null`,
///   defaultSchema?: default schema for when `schemas[key]` is `null`,
/// }
/// Sparse: { type: "sparse",
///   keys?: A list of permitted keys, `null` if all keys are permitted,
///   keySchema: Common schema for keys,
///   valueSchema: Common schema for values,
/// }

export function encode(data, schema) {
  return encodeItem(data, schema, null)
}
export function decode(string, schema) {
  let { result, offset } = decodeItem(string, 0, schema, null)
  if (offset != string.length)
    throw new Error(`Decoding string is too long ${string}`)
  return result
}

// Keep the length low. We might want to reserve high bits for later extension.
export function encodeLength(length) {
  if (length >= 32)
    throw new Error(`Length (${length}) too large`)
  return numberToString(length, 1)
}
export function decodeLength(string, offset) {
  let length = stringToNumber(string[offset])
  if (length >= 32)
    throw new Error(`Length (${length}) too large`)
  return {
    result: length,
    offset: offset + 1,
  }
}

function encodeItem(data, schema, pathItem) {
  try {
    if (schema.encode)
      data = schema.encode(data)
    switch (schema.type) {
      case "uint": return encodeUInt(data, schema)
      case "string": return encodeString(data, schema)
      case "fixed": return encodeFixed(data, schema)
      case "array": return encodeArray(data, schema)
      case "object": return encodeObject(data, schema)
      case "sparse": return encodeSparse(data, schema)
      default: throw new Error(`Unsupported schema type ${schema.type} on array`)
    }
  } catch (error) {
    error.path = error.path ?? []
    error.path.push(pathItem)
    throw error
  }
}
function decodeItem(string, offset, schema, pathItem) {
  try {
    let result
    switch (schema.type) {
      case "uint": ({result, offset} = decodeUInt(string, offset, schema)); break
      case "string": ({result, offset} = decodeString(string, offset, schema)); break
      case "fixed": ({result, offset} = decodeFixed(string, offset, schema)); break
      case "array": ({result, offset} = decodeArray(string, offset, schema)); break
      case "object": ({result, offset} = decodeObject(string, offset, schema)); break
      case "sparse": ({result, offset} = decodeSparse(string, offset, schema)); break
      default: throw new Error(`Unsupported schema type ${schema.type} on array`)
    }
    if (schema.decode) result = schema.decode(result)
    return { result, offset }
  } catch (error) {
    error.path = error.path ?? []
    error.path.push(pathItem)
    throw error
  }
}

function encodeSparse(data, schema) {
  const { keySchema, keys, valueSchema } = schema
  const items = Object.entries(data).filter(([key]) => keys?.includes(key) ?? true)

  return encodeLength(items.length) + items.map(([key, value]) =>
    encodeItem(key, keySchema, key) + encodeItem(value, valueSchema, key)
  ).join('')
}
function decodeSparse(string, offset, schema) {
  const { keys, keySchema, valueSchema } = schema
  let length
  ({result: length, offset} = decodeLength(string, offset))

  let result = Object.fromEntries([...new Array(length)].map(() => {
    let key, value;
    ({result: key, offset} = decodeItem(string, offset, keySchema, null));
    ({result: value, offset} = decodeItem(string, offset, valueSchema, key));
    return [key, value]
  }).filter(([key]) => keys?.includes(key) ?? true))

  return { result, offset }
}

function encodeObject(data, schema) {
  const { schemas=[], defaultSchema } = schema

  return Object.entries(schemas).map(([key, schema]) => {
    schema = schema ?? defaultSchema
    return encodeItem(key in data ? data[key] : schema.default, schema, key)
  }).join('')
}
function decodeObject(string, offset, schema) {
  const { schemas=[], defaultSchema } = schema

  const result = Object.fromEntries(Object.entries(schemas).map(([key, schema]) => {
    let result
    ({result, offset} = decodeItem(string, offset, schema ?? defaultSchema, key))
    return [key, result]
  }))
  return { result, offset }
}

function encodeArray(data, schema) {
  const { schemas = [], defaultSchema } = schema
  return encodeLength(data.length) + data.map((item, i) =>
    encodeItem(item, schemas[i] ?? defaultSchema, i)
  ).join('')
}
function decodeArray(string, offset, schema) {
  const { schemas = [], defaultSchema } = schema
  let length
  ({result: length, offset} = decodeLength(string, offset))
  let result = [...new Array(length)].map((unused, i) => {
    let result
    ({result, offset} = decodeItem(string, offset, schemas[i] ?? defaultSchema, i))
    return result
  })
  return { result, offset }
}

function encodeFixed(data, schema) {
  return encodeUInt(schema.list.indexOf(data), schema)
}
function decodeFixed(string, offset, schema) {
  let result
  ({result, offset} = decodeUInt(string, offset, schema))
  return { result: schema.list[result], offset }
}

function encodeString(string, schema) {
  if (!string.match(/^[a-z0-9\-_]+$/i))
    throw new Error(`Cannot encode string ${string}: not alphanumeric`)
  return encodeLength(string.length) + string
}
function decodeString(string, offset, schema) {
  let length
  ({ result: length, offset } = decodeLength(string, offset))
  return {
    result: string.slice(offset, offset + length),
    offset: offset + length
  }
}

function encodeUInt(uint, schema) {
  const string = numberToString(uint, schema.length)
  return schema.length ? string : (encodeLength(string.length) + string)
}
function decodeUInt(string, offset, schema) {
  let length = schema.length

  if (!schema.length)
    ({ result: length, offset } = decodeLength(string, offset))

  return {
    result: stringToNumber(string.slice(offset, offset + length)),
    offset: offset + length
  }
}

function numberToString(number, length = 0) {
  if (number < 0) throw new Error(`Cannot encode negative number ${number}`)

  var string = ""
  do {
    const remainder = number % 64
    number = Math.floor(number / 64)
    if (remainder < 10) // 0-9
      string += String.fromCharCode(remainder + 48 - 0)
    else if (remainder < 36) // a-z
      string += String.fromCharCode(remainder + 97 - 10)
    else if (remainder < 62) // A-Z
      string += String.fromCharCode(remainder + 65 - 36)
    else if (remainder === 62) // -
      string += "-"
    else if (remainder === 63) // _
      string += "_"
  } while (number > 0)

  if (!length)
    return string

  if (string.length > length)
    throw new Error(`Cannot encode uint ${number}: value too large`)
  return string.padEnd(length, "0")
}
function stringToNumber(string) {
  let result = 0, multiplier = 1

  for (let i = 0; i < string.length; i++) {
    let code = string.charCodeAt(i)

    if (48 <= code && code < 58) // 0-9
      result += multiplier * (code - 48 + 0)
    else if (97 <= code && code < 123) // a-z
      result += multiplier * (code - 97 + 10)
    else if (65 <= code && code < 91) // A-Z
      result += multiplier * (code - 65 + 36)
    else if (string[i] === '-')
      result += multiplier * 62
    else if (string[i] === '_')
      result += multiplier * 63
    else throw new Error(`Cannot parse UInt from "${string}", which contains "${String.fromCharCode(code)}"`)

    multiplier *= 64
  }

  return result
}
