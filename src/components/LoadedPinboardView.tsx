
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

  let defaultFolder = 'none'

  if (opts.storeData?.folders && bookmark.href && opts.storeData?.folders[bookmark.href]) {
    defaultFolder = opts.storeData?.folders[bookmark.href]
  }

  const edit = opts.active ? '    edit' : ''
  const folder = opts.folderBuffer && opts.folderBuffer.length > 0
    ? opts.folderBuffer.join('')
    : defaultFolder
  const predictedFolder = opts.predictedFolder ?? ''

  let textData = <Box><Text> {folder}</Text><Text color="#005cc5" inverse>{predictedFolder}</Text></Box>

  if (defaultFolder === 'none' && predictedFolder) {
//    textData = <Box><Text color="#005cc5" inverse>{predictedFolder}</Text></Box>
  }

  return (
    <>
      <Text inverse>{cursor} / {opts.bookmarkCount}{edit}</Text>
      <Text> </Text>
      <Text bold>folder:</Text>
      {textData}
      <Text bold>href:</Text><Text>  {bookmark?.href}</Text>
      <Text bold>description:</Text><Text>  {bookmark?.description}</Text>
    </>
  )
}
