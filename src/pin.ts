
import signale from 'signale'

import { Bookmark, Pinboard } from './apis/pinboard.js'
import constants from './constants.js'
import { Store } from './store.js'

export const pin = async (args: any): Promise<void> => {
  const key = process.env.PINBOARD_API_KEY

  if (typeof key === 'undefined') {
    signale.error(`${constants.codes.NO_API_KEY}: PINBOARD_API_KEY missing from environment`)
    process.exit(1)
  }

  const pin = new Pinboard(key)
  const store = new Store('data/pin.json')
  const storeData = await store.read()

  const lastUpdate = await pin.lastUpdate()

  if (storeData?.updateTime === lastUpdate.update_time) {
    signale.info('most recent data stored.')
    return
  }

  const bookmarks: Bookmark[] = []

  signale.info('retrieving bookmarks.')

  for await (const bookmark of pin.all()) {
    bookmarks.push(bookmark)
  }

  signale.info('storing bookmarks.')

  await store.write({
    updateTime: lastUpdate.update_time,
    bookmarks
  })

  signale.info('done.')
}
