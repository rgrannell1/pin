
import { Pinboard } from './apis/pinboard.js'

export const pin = async (args: any): Promise<void> => {
  const key = process.env.PINBOARD_API_KEY

  if (typeof key === 'undefined') {
    throw new Error('pinboard key not defined.')
  }

  const pin = new Pinboard(key)

  for await (const bookmark of pin.all()) {

  }
}
