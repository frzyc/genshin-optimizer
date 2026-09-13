# Tags

A tag is a dictionary of tag category (key) and tag value (value) pairs.
We denote a tag category and a tag value by `cat:` and `cat:val`, respectively.
When there is no ambiguity, `val` may be used instead of `cat:val`.
We also define a "combination" of tags `T1` and `T2`, denoted by `T1/T2`, as a tag such that for any tag category `cat:`,

- If `cat:v` ∈ `T2`, then `cat:v` ∈ `T1/T2`,
- If `cat:` ∉ `T2` and `cat:v` ∈ `T1`, then `cat:v` ∈ `T1/T2`, and
- If `cat:` ∉ `T2` and `cat:` ∉ `T1`, then `cat:` ∉ `T1/T2`.

Note the asymmetry between `T1` and `T2`.
As an example, the combination `{ c1:v1 c2:v2 }/{ c2:v3 c3:v4 }` is the tag `{ c1:v1 c2:v3 c3:v4 }`.
In this example, `c1:` and `c3:` exist in only one of the tags, and so their values are used.
For `c2:`, both tags contain different values, and so the value in the right tag is preferred.

## Tag Database Gathering

A calculator `calc` contains an array of tag-node pairs, called Tag Database.
Each entry `{ tag, value }` in the tag database signifies that the computation of `tag` should include `value`.
We denote a tag database entry with `tag <- value`.
If `value` is a reread to `tag2`, we may instead denote the entry with `tag <= tag2`.
Note the different arrow type between the two, as well as the type difference on the right side of the arrow.

With tag database, `calc` can _gather a tag `T`_ via `calc.gather(T)`, returning the computed results (`CalcResult[]`) of all entries in the tag database with matching tags.
An entry `tag <- value` in the tag database is included in a gathering iff for every `k:v` ∈ `tag`, `v == null` or `k:v` ∈ `T`.
If the value in the included entry is a `node`, its value is computed using tag `T`.
If the value is a `Reread` with tag `T2`, another gather is performed using `T/T2`, and its result is appended to the final result.
As an example, consider `calc.gather({ c1:v1 c2:vA })` when the `calc`ulator has the following Tag Database,

```
[
  { c1:v1       } <- node1, // entry 1
  { c1:v2       } <- node2, // entry 2
  { c1:v1 c2:vA } <- node3, // entry 3
  { c1:v1 c2:vB } <- node4, // entry 4
  {       c2:vA } <- node5, // entry 5
  { c1:v1 c2:vA } <= { c2:vB } // entry 6
].
```

In this case, `calc` first selects the matching entries 1, 3, 5, and 6.
As entries 1, 3, and 5 contain nodes, `calc` computes nodes 1, 3, and 5 with tag `{ c1:v1 c2:vA }`.
Next, the the calculator resolves entry 6, by performing a gathering with tag `{ c1:v1 c2:vA }/{ c2:vB } = { c1:v1 c2:vB }`, computing nodes 1 and 4 with tag `{ c1:v1 c2:vB }`.
The calculator then returns the following:

- Value of `node1` computed with tag `{ c1:v1 c2:vA }`,
- Value of `node3` computed with tag `{ c1:v1 c2:vA }`,
- Value of `node5` computed with tag `{ c1:v1 c2:vA }`,
- Value of `node1` computed with tag `{ c1:v1 c2:vB }`, and
- Value of `node4` computed with tag `{ c1:v1 c2:vB }`.

Note that `node1` is computed twice, each with different tags, due to `reread` operation.
