
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

  async lastUpdate (): Promise<{ update_time: string}> {
    const response = await fetch(`https://${this.key}@api.pinboard.in/v1/posts/update?format=json`)

    if (response.status === 429) {
      signale.error(`${constants.codes.TOO_MANY_REQUESTS}: ${await response.text()}`)
      process.exit(1)
    } else if (response.status !== 200) {
      signale.error(`${constants.codes.BAD_RESPONSE}: ${await response.text()}`)
      process.exit(1)
    }

    return await response.json()
  }

  async * all (): AsyncGenerator<Bookmark> {
    let start = 0
    const offset = 10

    while (true) {
      const response = await fetch(`https://${this.key}@api.pinboard.in/v1/posts/all?start=${start}&results=${offset}&format=json`)
      start += offset

      if (response.status === 429) {
        signale.error(`${constants.codes.TOO_MANY_REQUESTS}: ${await response.text()}`)
        process.exit(1)
      } else if (response.status !== 200) {
        signale.error(`${constants.codes.BAD_RESPONSE}: ${await response.text()}`)
        process.exit(1)
      }

      const bookmarks = await response.json()

      for (const bookmark of bookmarks) {
        yield bookmark as Bookmark
      }

      if (bookmarks.length === 0) {
        return
      }
    }
  }
}
