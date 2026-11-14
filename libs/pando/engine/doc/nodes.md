# Node Operations

This section outlines all operations supported by Pando.
Operations are separated into three types, arithmetic, branching, and tag-related.

## Arithmetic Operations

- `constant(c)`: values of a constant `c` (converting it to a `Node`),
  - This is normally unneeded as most functions permit both `Node` and constants,
- `sum(x1, x2, ...) := x1 + x2 + ...`,
- `prod(x1, x2, ...) := x1 * x2 * ...`,
- `min(x1, x2, ...) := Math.min(x1, x2, ...)`,
- `max(x1, x2, ...) := Math.max(x1, x2, ...)`,
- `sumfrac(x1, x2) := x1 / (x1 + x2)`,
- `subscript(index, array) := array[index]`.
  `array` can be either array of strings or of numbers,
- `custom(op, x1, x2, ...)` is for custom node for non-standard computations,
  - See [Calculator Customization](./customization.md) on how to add support for custom operations.

## Branching Operations

Most branching functions are of the form `cmp<<CMP>>(x1, x2, pass, fail)` where a comparator CMP (e.g., `Eq`) is used to compare `x1` and `x2`.
If the comparison yields true (e.g., `x1 == x2` for `cmpEq`), then `pass` branch is chosen.
Otherwise, `fail` branch is chosen.
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
When computing with a current tag `Tcur`

- `tagVal(cat)` reads the value of `Tcur` at category `cat`, or `""` if `cat:` ∉ `Tcur`,
- `tag(v, tag)` calculates `v` using `Tcur/tag`,
- `dynTag(v, tag)` calculates `v` using `Tcur/tag`.
  The main difference compared to `tag` operation is that the tag values in `dynTag` can be other nodes, which are computed with `Tcur` tag.
  When both `dynTag` and `tag` are applicable, prefer `tag` for performance reason.
- `read(tag, accu)` performs a gather with tag `Tcur/tag`, then combine the results using `accu`mulator the accumulators include `sum/prod/min/max`, corresponding to the arithmetic operations, or `'unique'`, which asserts the gather has exactly one entry and returns it.
  Accumulator may be `undefined`, in which case it falls back to the calculator's `defaultAccu(tag)` (see [customization](./customization.md)) and finally to `'unique'`.
- `reread(tag)` is not a value-producing node but a gather-time redirection: an entry `Tdst <- reread(Tsrc)` makes a gather of `Tdst` also pull in every entry gathered for `Tcur/Tsrc`. It is how one tag's contributions are folded into another's (the basis of the per-game "glue").
