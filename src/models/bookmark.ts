
interface BookmarkOpts {
  href: string
  description: string
  extended: string
  meta: string
  hash: string
  time: string
  shared: string
  toread: string
  tags: string
}

/**
 * A model containing Pinboard bookmark information
 */
export class Bookmark {
  href: string
  description: string
  extended: string
  meta: string
  hash: string
  time: string
  shared: string
  toread: string
  tags: string

  constructor (opts: BookmarkOpts) {
    this.href = opts.href
    this.description = opts.description
    this.extended = opts.extended
    this.meta = opts.meta
    this.hash = opts.hash
    this.time = opts.time
    this.shared = opts.shared
    this.toread = opts.toread
    this.tags = opts.tags
  }
}
