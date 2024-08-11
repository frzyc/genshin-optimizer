# Tag and Tag Database

A tag is dictionary of tag category (key) and tag value (value) pairs.
We denote a tag category using `cat:`, and a tag value using `cat:val`.

We also define "tag combination", where tags `T1` and `T2` are combined to create a new tag, denoted `T1/T2`. The resulting tag `T` satisfies the following,
- If `cat:v` ∈ `T2`, then `cat:v` ∈ `T`,
- If `cat:` ∉ `T2` and `cat:v` ∈ `T1`, then `cat:v` ∈ `T`,
- If `cat:` ∉ `T2` and `cat:` ∉ `T1`, then `cat:` ∉ `T`.
That is, `T2` overrides tag entries in `T1`.
Note the asymmetry between `T1` and `T2`.

## Tag Database and Gathering

A calculator `calc` contains an array of tag-node pairs, called Tag Database.
Each entry `{ tag, val }` in the tag database signifies that the value of `tag` should include the calculation of `val`.
With tag database, `calc` can *gather a tag `T`* using `calc.get(T)`, which returns all entries in the tag database with matching tags.
An entry `{ tag, val }` in the tag database is included in a gathering iff for every `k:v` ∈ `tag`, `k:v` is also in `T`.

TODO: discuss what happens when gathering a reread entry

# Node Operations

This section outlines all operations supported by Pando.
Operations are separated into three types, arithmetic, branching, and tag-related.

## Arithmetic Operations

- `constant(c)`: values of a constant `c` (converting it into a `Node`),
  - This is normally unneeded as most functions permit both `Node` and constants,
- `sum(x1, x2, ...) := x1 + x2 + ...`,
- `prod(x1, x2, ...) := x1 * x2 * ...`,
- `min(x1, x2, ...) := Math.min(x1, x2, ...)`,
- `max(x1, x2, ...) := Math.max(x1, x2, ...)`,
- `sumfrac(x1, x2) := x1 / (x1 + x2)`,
- `subscript(index, array) := array[index]`. `array` can be either array of strings or of numbers,
- `custom(op, x1, x2, ...)` is for custom node for non-standard computations,
  - See [TODO] on how to add support for custom operations.

## Branching Operations 

Most branching functions are of the form `cmp<<CMP>>(x1, x2, pass, fail)` where a comparator CMP (e.g., `Eq`) is used to compare `x1` and `x2`.
If the comparison yields true (e.g., `x1 == x2` for `cmpEq`), then `pass` branch is chosen. Otherwise, `fail` branch is chosen.
Unchosen branch is not evaluated.
`fail` can be omitted if it is 0.
Supported comparators include
- `Eq` (`x1 == x2`) and `NE` (`x1 != x2`),
- `GE` (`x1 >= x2`) and `GT` (`x1 > x2`), and
- `LE` (`x1 <= x2`) and `LT` (`x1 < x2`).

Another branching function is `lookup(key, table, defaultV) := table[key] ?? defaultV`.
There are two main distinctions between `subscript` and `lookup`:
- `lookup` indices are strings while `subscript` indices are numbers, and
- `lookup` `table` may contain complex nodes while `subscript` `array` can contain only constants.
Nodes other than `table[key]` are not evaluated.
When both `lookup` and `subscript` are applicable, prefer `subscript` for performance reason.

## Tag-Related Operations 

By default, all arithmetic and branching operations preserve the tags, e.g., calculating `sum(x1, x2)` with a tag `T`, the calculation of `x1` and `x2` also use the same tag `T`.

- `tagVal(cat)` reads the value of the current tag at category `cat`, or `""` if `cat:` ∉ current tag,
- `tag(v, tag)` calculates `v` using the tag combination `current tag/tag`,
- `dynTag(v, tag)` calculates `v` using the tag combination `current tag/tag`. The main difference compared to `tag` operation is that the tag values in `dynTag` can be other nodes, which are computed with `Tbase` tag. When both `dynTax` and `tag` are applicable, prefer `tag` for performance reason.

### Read and Reread Operations

TODO: explain read and reread

As an example, when performing `calc.compute(read({ c1:v1 c2:v3 }, "sum"))` with a calculator `calc` that has a Tag Database:
```
[
  { tag: { c1:v1       }, val: node1 }, // entry 1
  { tag: { c1:v2       }, val: node2 }, // entry 2
  { tag: { c1:v1 c2:vA }, val: node3 }, // entry 3
  { tag: { c1:v1 c2:vB }, val: node4 }, // entry 4
  { tag: {       c2:vA }, val: node5 }, // entry 5
  { tag: { c1:v1 c2:vA }, val: reread({ c2:v4 }) } // entry 6
]
```
the calculator
- Gathers entries matching `{ c1:v1 c2:vA }` (entries 1, 3, 5, and 6),
  - Computes `node1` with tag `{ c1:v1 c2:vA }` (node1A),
  - Computes `node3` with tag `{ c1:v1 c2:vA }`,
  - Computes `node5` with tag `{ c1:v1 c2:vA }`,
  - As entry 6 is a `reread`, gathers entries matching `{ c1:v1 c2:vB }` (entries 1, 4, note the different `c2:` throughout this part)
    - Computes `node1` with tag `{ c1:v1 c2:vB }` (node1B),
    - Computes `node4` with tag `{ c1:v1 c2:vB }`,
- Apply `sum` accumulator, yielding `node1A + node3 + node5 + node1B + node4`.
Note that `node1` is computed twice, each with different tags, due to `reread` operation.
