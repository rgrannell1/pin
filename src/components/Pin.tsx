
import * as path from 'path'
import React from 'react'

import keypress from 'keypress'

import config from '../config/default.js'
import { Chrome } from '../apis/chrome.js'

import { Bookmark, Pinboard } from '../apis/pinboard.js'
import constants from '../constants.js'
import { Store, StoreData } from '../store.js'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { ErrorView } from './ErrorView.js'
import { LoadingPinboardView } from './LoadingPinboardView.js'
import { LoadedPinboardView } from './LoadedPinboardView.js'

const dirnameVar = dirname(fileURLToPath(import.meta.url))

interface PinProps {
  bookmarkPath: string
}

export interface Key {
  readonly ctrl: Boolean
  readonly meta: Boolean
  readonly shift: Boolean
  readonly sequence: string
  readonly name: string | undefined
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
  cursor: number
  ttyIn: any
}

interface PinErrorState {
  state: 'ERROR'
  message: string
}

interface Common {
  ttyIn: any
}

type PinState = PinStateLoading & Common | PinStateLoaded & Common | PinErrorState & Common

const fpath = path.join(dirnameVar, '../../data/pin.json')

export class Pin extends React.Component<PinProps, PinState> {
  constructor (props: PinProps) {
    super(props)

    keypress(process.stdin)

    const key = config.pinboardApiKey

    const ttyIn = process.stdin
    ttyIn.on('keypress', this.handleKeyPress.bind(this))

    process.stdin.setRawMode(true)
    process.stdin.resume()

    if (typeof key === 'undefined') {
      this.state = {
        state: 'ERROR',
        message: `${constants.codes.NO_API_KEY}: PINBOARD_API_KEY missing from environment`,
        ttyIn
      }
      return
    }

    this.state = {
      pin: new Pinboard(key),
      store: new Store(fpath),
      browser: new Chrome(props.bookmarkPath),

      state: 'LOADING_PINBOARD',
      bookmarkCount: 0,
      ttyIn
    }
  }

  handleKeyPress (_: any, key: any) {
    if (key && key.ctrl && (key.name == 'c' || key.name === 'z')) {
      process.exit(0)
    }

    if (this.state.state !== 'LOADED_PINBOARD') {
      return
    }

    if (key.name === 'up') {
      this.setState({
        ...this.state,
        cursor: Math.min((this.state.cursor ?? 0) + 1, this.state.bookmarkCount - 1)
      })

      return
    }

    if (key.name === 'down') {
      this.setState({
        ...this.state,
        cursor: Math.max((this.state.cursor ?? 0) - 1, 0)
      })

      return
    }

    this.setState({
      ...this.state,
      cursor: (this.state.cursor ?? 0) + 1
    })

  }

  async loadBookmarks () {
    if (this.state.state === 'ERROR') {
      return
    }

    // -- fetch last update time
    try {
      var lastUpdate = await this.state.pin.lastUpdate()
    } catch (err) {
      this.setState({
        state: 'ERROR',
        message: err.message,
        ttyIn: this.state.ttyIn
      })
      return
    }
    const storeData = await this.state.store.read()

    // -- accurate bookmark information stored.
    if (storeData?.updateTime === lastUpdate.update_time) {
      this.setState({
        state: 'LOADED_PINBOARD',
        storeData,
        bookmarkCount: storeData.bookmarks.length,
        ttyIn: this.state.ttyIn
      })

      return
    }

    // -- read all bookmarks
    let bookmarkCount = 0
    const bookmarks: Bookmark[] = []

    // -- update the state for each loaded bookmark
    for await (const bookmark of this.state.pin.all()) {
      this.setState({
        state: 'LOADING_PINBOARD',
        bookmarkCount,
        ttyIn: this.state.ttyIn
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
      bookmarkCount: bookmarks.length,
      cursor: 0,
      ttyIn: this.state.ttyIn
    })
  }

  async componentDidMount (): Promise<void> {
    if (this.state.state === 'ERROR') {
      return
    }

    await this.state.browser.initialise()
    await this.loadBookmarks()
  }

  render (): any {
    if (this.state.state === 'ERROR') {
      return ErrorView({
        message: this.state.message
      })
    } else if (this.state.state === 'LOADING_PINBOARD') {
      return LoadingPinboardView({
        bookmarkCount: this.state.bookmarkCount
      })
    } else if (this.state.state === 'LOADED_PINBOARD') {
      return LoadedPinboardView({
        cursor: this.state.cursor,
        bookmarkCount: this.state.bookmarkCount,
        storeData: this.state.storeData
      })
    }
  }
}
