
import fetch from 'node-fetch'
import signale from 'signale'
import constants from '../constants.js'

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
}

export class Pinboard {
  key: string

  constructor (key: string) {
    this.key = key
  }
  /**
   * Return an async iterator for all pinboard bookmarks.
   */

  async * all(): AsyncGenerator<Bookmark> {
    let start = 0
    const offset = 10
    console.log(this.key)
    while (true) {
      const results = await fetch(`https://${this.key}@api.pinboard.in/v1/posts/all?start=${start}&results=${offset}&format=json`)
      start += offset

      if (results.status !== 200) {
        signale.error(`${constants.codes.BAD_RESPONSE}: ${await results.text()}`)
        process.exit(1)
      }

      const bookmarks = await results.json()

      for (const bookmark of bookmarks) {
        yield bookmark as Bookmark
      }

      console.log([start, offset])

      if (bookmarks.length === 0) {
        return
      }
    }
  }
}
