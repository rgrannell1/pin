
import ink from 'ink'
import React from 'react'

import { Pin } from './components/Pin.js'

const { render } = ink

export const pin = async (args: Record<string, any>): Promise<void> => {
  const bookmarkPath = args['<fpath>']

  render(<React.StrictMode><Pin bookmarkPath={bookmarkPath} /></React.StrictMode>, {

  })
}
