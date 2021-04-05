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
///   schemas: A key-schema dictionary. All keys are encoded {
///     default: default value if the object[key] doesn't exist
///   }
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
  const stream = new BlockStream(string)
  const result = decodeItem(stream, schema, null)
  stream.end()
  return result
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
function decodeItem(stream, schema, pathItem) {
  try {
    let result
    switch (schema.type) {
      case "uint": result = decodeUInt(stream, schema); break
      case "string": result = decodeString(stream, schema); break
      case "fixed": result = decodeFixed(stream, schema); break
      case "array": result = decodeArray(stream, schema); break
      case "object": result = decodeObject(stream, schema); break
      case "sparse": result = decodeSparse(stream, schema); break
      default: throw new Error(`Unsupported schema type ${schema.type} on array`)
    }
    if (schema.decode)
      return schema.decode(result)
    return result
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
function decodeSparse(stream, schema) {
  const { keys, keySchema, valueSchema } = schema
  const length = decodeLength(stream)

  return Object.fromEntries([...new Array(length)].map(() => {
    const key = decodeItem(stream, keySchema, null)
    const value = decodeItem(stream, valueSchema, key)
    return [key, value]
  }).filter(([key]) => keys?.includes(key) ?? true))
}

function encodeObject(data, schema) {
  const { schemas = [] } = schema
  return Object.entries(schemas).map(([key, schema]) =>
    encodeItem(key in data ? data[key] : schema.default, schema, key)
  ).join('')
}
function decodeObject(stream, schema) {
  const { schemas = [] } = schema
  return Object.fromEntries(Object.entries(schemas).map(([key, schema]) =>
    [key, decodeItem(stream, schema, key)]
  ))
}

function encodeArray(data, schema) {
  const { schemas = [], defaultSchema } = schema
  return encodeLength(data.length) + data.map((item, i) =>
    encodeItem(item, schemas[i] ?? defaultSchema, i)
  ).join('')
}
function decodeArray(stream, schema) {
  const { schemas = [], defaultSchema } = schema, length = decodeLength(stream)
  return [...new Array(length)].map((unused, i) =>
    decodeItem(stream, schemas[i] ?? defaultSchema, i))
}

const encodeFixed = (data, schema) => encodeUInt(schema.list.indexOf(data), schema)
const decodeFixed = (stream, schema) => schema.list[decodeUInt(stream, schema)]

function encodeString(string, schema) {
  if (!string.match(/^[a-z0-9\-_]+$/i))
    throw new Error(`Cannot encode string ${string}: not alphanumeric or -_`)
  return encodeLength(string.length) + string
}
function decodeString(stream, schema) {
  const string = stream.take(decodeLength(stream))
  if (!string.match(/^[a-z0-9\-_]+$/i))
    throw new Error(`Cannot decode string ${string}: not alphanumeric or -_`)
  return string
}

function encodeUInt(uint, schema) {
  const string = numberToString(uint, schema.length)
  return schema.length ? string : (encodeLength(string.length) + string)
}
function decodeUInt(stream, schema) {
  let length = schema.length || decodeLength(stream)
  return stringToNumber(stream.take(length))
}

// Keep the length low. We might want to reserve high bits for later extension.
function encodeLength(length) {
  if (length >= 32)
    throw new Error(`Length (${length}) too large`)
  return numberToString(length, 1)
}
function decodeLength(stream) {
  let length = stringToNumber(stream.take(1))
  if (length >= 32)
    throw new Error(`Length (${length}) too large`)
  return length
}

function numberToString(number, length = 0) {
  if (number < 0) throw new Error(`Cannot encode negative number ${number}`)

  var string = ""
  while (number > 0) {
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
  }

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

function BlockStream(string) {
  this.string = string
  this.offset = 0
}
BlockStream.prototype.take = function(count) {
  if (this.offset + count > this.string.length)
    throw new Error(`Cannot take ${count} items from ${this.string.slice(this.offset)}`)

  const result = this.string.slice(this.offset, this.offset + count)
  this.offset += count
  return result
}
BlockStream.prototype.end = function() {
  if (this.string.length !== this.offset)
    throw new Error(`Unused string ${this.string.slice(this.offset)}`)
}
