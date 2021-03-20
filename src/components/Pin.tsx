
import * as path from 'path'
import React from 'react'

import { Chrome } from '../apis/chrome.js'

import { Bookmark, Pinboard } from '../apis/pinboard.js'
import constants from '../constants.js'
import { Store, StoreData } from '../store.js'

import { Text } from 'ink'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const dirnameVar = dirname(fileURLToPath(import.meta.url))

interface PinProps {
  bookmarkPath: string
}

interface PinStateLoading {
  browser: Chrome
  store: Store
  pin: Pinboard
  state: 'LOADING_PINBOARD'
  storeData?: StoreData
  bookmarkCount: number
}

interface PinStateLoaded {
  browser: Chrome
  store: Store
  pin: Pinboard
  state: 'LOADED_PINBOARD'
  storeData?: StoreData
  bookmarkCount: number
}

interface PinErrorState {
  state: 'ERROR'
  message: string
}

type PinState = PinStateLoading | PinStateLoaded | PinErrorState

export class Pin extends React.Component<PinProps, PinState> {
  constructor (props: PinProps) {
    super(props)

    const key = process.env.PINBOARD_API_KEY

    if (typeof key === 'undefined') {
      this.state = {
        state: 'ERROR',
        message: `${constants.codes.NO_API_KEY}: PINBOARD_API_KEY missing from environment`
      }
      return
    }

    const fpath = path.join(dirnameVar, '../../data/pin.json')

    this.state = {
      // -- service classes
      pin: new Pinboard(key),
      store: new Store(fpath),
      browser: new Chrome(props.bookmarkPath),

      state: 'LOADING_PINBOARD',
      bookmarkCount: 0
    }
  }

  async componentDidMount (): Promise<void> {
    if (this.state.state === 'ERROR') {
      return
    }

    await this.state.browser.initialise()

    try {
      var lastUpdate = await this.state.pin.lastUpdate()
    } catch (err) {
      this.setState({
        state: 'ERROR',
        message: err.message
      })
      return
    }
    const storeData = await this.state.store.read()

    // -- accurate bookmark information stored.
    if (storeData?.updateTime === lastUpdate.update_time) {
      this.setState({
        state: 'LOADED_PINBOARD',
        storeData,
        bookmarkCount: storeData.bookmarks.length
      })

      return
    }

    // -- read all bookmarks
    let bookmarkCount = 0
    const bookmarks: Bookmark[] = []

    for await (const bookmark of this.state.pin.all()) {
      this.setState({
        state: 'LOADING_PINBOARD',
        bookmarkCount
      })

      bookmarks.push(bookmark)
      bookmarkCount++
    }

    // -- write to storage
    await this.state.store.write({
      updateTime: lastUpdate.update_time,
      bookmarks
    })

    // -- update state as loaded.
    this.setState({
      state: 'LOADED_PINBOARD',
      storeData,
      bookmarkCount: bookmarks.length
    })
  }

  render (): any {
    if (this.state.state === 'ERROR') {
      return (
        <>
          <Text>Error: {this.state.message}</Text>
        </>
      )
    } else if (this.state.state === 'LOADING_PINBOARD') {
      return (
        <>
          <Text>Retrieved {this.state.bookmarkCount} Bookmarks From Pinboard 📌...</Text>
        </>
      )
    } else if (this.state.state === 'LOADED_PINBOARD') {
      return (
        <>
          <Text>Retrieved all {this.state.bookmarkCount} Bookmarks...</Text>
        </>
      )
    }
    return (
      <>
        <Text>Unknown State</Text>
      </>
    )
  }
}
