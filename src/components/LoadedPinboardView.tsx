
import React from 'react'
import { Text, Box } from 'ink'

import { Bookmark } from '../models/bookmark.js'
import { Store } from '../store.js'
import { Folder } from '../models/folder.js'

interface LoadedPinboardViewOpts {
  cursor?: number
  bookmarkCount: number
  store: Store
  folder?: Folder
  active: boolean
  bookmark: Bookmark
  folderBuffer: string[]
  predictedFolder: string
}

/**
 * Render the pinboard
 *
 * @param opts view data
 *
 * @returns
 */
export function LoadedPinboardView (opts: LoadedPinboardViewOpts): any {
  const { bookmark, folder: savedFolder } = opts

  let defaultFolder = opts.active ? '' : 'none'

  if (typeof savedFolder !== 'undefined') {
    defaultFolder = savedFolder.folder
  }

  const edit = opts.active ? '    edit' : ''
  const folder = typeof opts.folderBuffer !== 'undefined' && opts.folderBuffer.length > 0
    ? opts.folderBuffer.join('')
    : defaultFolder
  const predictedFolder = opts.predictedFolder ?? ''

  const textData = <Box><Text> {folder}</Text><Text color='#005cc5' inverse>{predictedFolder}</Text></Box>

  return (
    <>
      <Text inverse>{(opts.cursor ?? 0) + 1} / {opts.bookmarkCount}{edit}</Text>
      <Text> </Text>
      <Text bold>folder:</Text>
      {textData}
      <Text bold>href:</Text><Text>  {bookmark?.href}</Text>
      <Text bold>description:</Text><Text>  {bookmark?.description}</Text>
    </>
  )
}
