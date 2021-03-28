
import React from 'react'
import { Bookmark } from '../apis/pinboard.js'

import { Text } from 'ink'
import { StoreData } from '../store.js'

interface LoadedPinboardViewOpts {
  cursor?: number
  bookmarkCount: number
  storeData?: StoreData
}

export function LoadedPinboardView (opts: LoadedPinboardViewOpts): any {
  const cursor = opts.cursor ?? 0
  const bookmark = opts.storeData?.bookmarks[cursor] as Bookmark

  return (
    <>
      <Text inverse>{cursor} / {opts.bookmarkCount}</Text>
      <Text> </Text>
      <Text bold>href:</Text><Text> {bookmark?.href}</Text>
      <Text bold>description:</Text><Text> {bookmark?.description}</Text>
    </>
  )
}
