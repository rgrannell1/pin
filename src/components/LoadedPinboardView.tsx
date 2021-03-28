
import React from 'react'
import { Bookmark } from '../apis/pinboard.js'

import { Text, Box } from 'ink'
import { StoreData } from '../store.js'

interface LoadedPinboardViewOpts {
  cursor?: number
  bookmarkCount: number
  storeData?: StoreData
  folders: string[]
  active: boolean
  folderBuffer: string[]
  predictedFolder: string
}

export function LoadedPinboardView (opts: LoadedPinboardViewOpts): any {
  const cursor = opts.cursor ?? 0
  const bookmark = opts.storeData?.bookmarks[cursor] as Bookmark

  const edit = opts.active ? '    edit' : ''
  const folder = opts.folderBuffer && opts.folderBuffer.length > 0
    ? opts.folderBuffer.join('')
    : 'none'
  const predictedFolder = opts.predictedFolder

  return (
    <>
      <Text inverse>{cursor} / {opts.bookmarkCount}{edit}</Text>
      <Text> </Text>
      <Text bold>folder:</Text>
        <Box><Text> {folder}</Text><Text inverse>{predictedFolder}</Text></Box>
      <Text bold>href:</Text><Text>  {bookmark?.href}</Text>
      <Text bold>description:</Text><Text>  {bookmark?.description}</Text>
    </>
  )
}
