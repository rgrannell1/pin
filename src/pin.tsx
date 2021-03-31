
import ink from 'ink'
import React from 'react'

import { Pin } from './components/Pin.js'
const { render } = ink

/**
 * The core application
 *
 * @param args command-line arguments
 */
export const pin = async (args: Record<string, any>): Promise<void> => {
  const bookmarkPath = args['--bookmarks']

  render(<React.StrictMode><Pin bookmarkPath={bookmarkPath} /></React.StrictMode>, { })
}
