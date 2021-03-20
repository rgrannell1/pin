
import docopt from 'docopt'
import signale from 'signale'

import constants from './constants.js'
import { pin } from './pin.js'

const docs = `
Pin - Interact with Pinboard

Usage:
  pin

Description:

`

const main = async (): Promise<void> => {
  const args = docopt.docopt(docs, {})

  await pin(args)
}

main().catch((err: Error) => {
  signale.error(`${constants.codes.UNCAUGHT_FATAL}: uncaught error: ${err?.message}\n${err?.stack ?? ''}`)
  throw err
})
