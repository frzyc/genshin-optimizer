/** Tag category; written as <category>:, such as `a:`. */
export type TagCategory = string
/**
 * Tag value; written as <category>:<value>, such as `a:x`.
 * Category maybe omitted if there is no confusion, such as `x`.
 */
export type TagValue = string

/**
 * Each tag is written as a list of `<category>:<value>`, such as `{ a:x, b:y }`.
 * If there is no confusion on the category that the value belongs to, category
 * may be omitted, e.g., `{ x, b:y }`.
 *
 * For a tag to match, every tag category must have the same tag value. Entries
 * with `null` value is treated as non-existent during comparison. `cat:null` is
 * used only to signify that the category will be removed when the tag is combined
 * with other tags.
 */
export type Tag = Record<TagCategory, TagValue | null>
