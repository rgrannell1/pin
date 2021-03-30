
import React from 'react'
import { Text } from 'ink'

interface LoadingPinboardViewOpts {
  bookmarkCount: number
}

/**
 * Display the number of bookmarks retrieved from Pinboard
 *
 * @param opts view data
 *
 * @returns
 */
export function LoadingPinboardView (opts: LoadingPinboardViewOpts): any {
  return (
    <>
      <Text>Retrieved {opts.bookmarkCount} Bookmarks From Pinboard 📌...</Text>
    </>
  )
}
