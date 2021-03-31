
import ink from 'ink'
import * as path from 'path'
import * as fs from 'fs'

import React from 'react'
import { Chrome } from './apis/chrome.js'

import { Pin } from './components/Pin.js'
const { render } = ink

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Store } from './store.js'
import signale from 'signale'

const dir = dirname(fileURLToPath(import.meta.url))
const fpath = path.join(dir, '../../data/data.db')

/**
 * The core application
 *
 * @param args command-line arguments
 */
export const pin = async (args: Record<string, any>): Promise<void> => {
  const bookmarkPath = args['--bookmarks']

  if (args.edit) {
    render(<React.StrictMode><Pin bookmarkPath={bookmarkPath} /></React.StrictMode>, {})
  } else {
    const chrome = new Chrome(bookmarkPath)
    const store = new Store(fpath)

    const chromeContent = await chrome.asBookmarkFile(store)

    const bookmarkOutPath = path.join(dir, '../../bookmarks.html')
    await fs.promises.writeFile(bookmarkOutPath, chromeContent)

    signale.info(`bookmarks created and saved to ${bookmarkOutPath}`)
  }
}
