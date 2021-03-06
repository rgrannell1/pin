
import fetch from 'node-fetch'
import signale from 'signale'
import { Bookmark } from '../models/bookmark.js'
import constants from '../constants.js'

/**
 * Pinboard API
 *
 * See https://pinboard.in/api/ for details
 */
export class Pinboard {
  key: string

  constructor (key: string) {
    this.key = key
  }

  /**
   * Get the last update time for a pinboard account
   *
   * @returns the API's JSON-response
   */
  async lastUpdate (): Promise<{ update_time: string}> {
    const response = await fetch(`https://api.pinboard.in/v1/posts/update?format=json&auth_token=${this.key}`)

    if (response.status === 401) {
      throw new Error(`${constants.codes.UNAUTHENTICATED}: ${await response.text()}. Did you set valid credentials as PINBOARD_API_KEY?`)
    } else if (response.status === 429) {
      throw new Error(`${constants.codes.TOO_MANY_REQUESTS}: ${await response.text()}`)
    } else if (response.status !== 200) {
      throw new Error(`${constants.codes.BAD_RESPONSE}: ${await response.text()}`)
    }

    return await response.json()
  }

  /**
   * Enumerate all pinboard bookmarks
   *
   * @returns a generator of bookmarks
   */
  async * all (): AsyncGenerator<Bookmark> {
    let start = 0
    const offset = 50

    while (true) {
      const response = await fetch(`https://api.pinboard.in/v1/posts/all?start=${start}&results=${offset}&format=json&auth_token=${this.key}`)
      start += offset

      if (response.status === 429) {
        signale.error(`${constants.codes.TOO_MANY_REQUESTS}: ${await response.text()}`)
      } else if (response.status !== 200) {
        signale.error(`${constants.codes.BAD_RESPONSE}: ${await response.text()}`)
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
