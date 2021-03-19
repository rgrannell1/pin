
import docopt from 'docopt'
import { pin } from './pin.js'

const docs = `
Pin - Interact with Pinboard

Usage:
  pin
`

const main = async (): Promise<void> => {
  const args = docopt.docopt(docs, {})

  await pin(args)
}

main().catch(err => {
  throw err
})
