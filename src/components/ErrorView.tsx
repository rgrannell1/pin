
import React from 'react'
import { Text } from 'ink'

interface ErrorViewOpts {
  message: string
}

export function ErrorView (opts: ErrorViewOpts): any {
  return (
    <>
      <Text>Error: {opts.message}</Text>
    </>
  )
}
