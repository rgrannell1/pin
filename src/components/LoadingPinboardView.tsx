
import React from 'react'
import { Text } from 'ink'

interface LoadingPinboardViewOpts {
  bookmarkCount: number
}

export function LoadingPinboardView (opts: LoadingPinboardViewOpts): any {
  return (
    <>
      <Text>Retrieved {opts.bookmarkCount} Bookmarks From Pinboard 📌...</Text>
    </>
  )
}
