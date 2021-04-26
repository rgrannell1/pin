
import * as path from 'path'
import React from 'react'

import keypress from 'keypress'

import config from '../../config/default.js'
import { Chrome } from '../../apis/chrome.js'

import { Pinboard } from '../../apis/pinboard.js'
import constants from '../../constants.js'
import { Store } from '../../store.js'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { ErrorView } from '../ErrorView.js'
import { LoadingPinboardView } from '../LoadingPinboardView.js'
import { LoadedPinboardView } from '../LoadedPinboardView.js'
import { Folder } from '../../models/folder.js'
import { Bookmark } from '../../models/bookmark.js'
import handleKeyPress from './handle-keypress.js'

const dir = dirname(fileURLToPath(import.meta.url))

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
  bookmarkCount: number
}

interface PinStateLoaded {
  browser: Chrome
  store: Store
  pin: Pinboard
  state: 'LOADED_PINBOARD'
  bookmarkCount: number
  bookmark: Bookmark
  folder: Folder | undefined
  cursor: number
  ttyIn: any
  active: boolean
  folderBuffer: string[]
  predictedFolder: string
  lastUpdate: { update_time: string }
}

interface PinErrorState {
  state: 'ERROR'
  message: string
}

interface Common {
  ttyIn: any
}

type PinState = PinStateLoading & Common | PinStateLoaded & Common | PinErrorState & Common

const fpath = path.join(dir, '../../../../data/data.db')

interface Keypress {
  ctrl: boolean
  name?: string
  shift?: boolean
}

export class Pin extends React.Component<PinProps, PinState> {
  constructor(props: PinProps) {
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

  /**
   * Save a folder-name after editing it
   *
   * @returns undefined
   */
  async saveFolder(): Promise<void> {
    if (this.state.state !== 'LOADED_PINBOARD') {
      return
    }

    let folder = this.state.folderBuffer.join('')

    if (this.state.predictedFolder !== 'undefined' && typeof this.state.predictedFolder !== 'undefined') {
      folder += this.state.predictedFolder
    }

    const store = this.state.store
    const bookmark = await store.getBookmark(this.state.cursor)

    await store.addFolder(new Folder(bookmark.href, folder))
  }

  async handleKeyPress (_: any, key: Keypress | undefined) {
    return handleKeyPress(this, _, key)
  }

  /**
   * Load bookmarks
   *
   * @returns
   */
  async loadBookmarks(): Promise<void> {
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

    const store = this.state.store
    const storedUpdateTime = await store.getUpdateTime()
    const count = await store.getBookmarkCount()

    // -- accurate bookmark information stored.
    if (storedUpdateTime === lastUpdate.update_time) {
      const bookmark = await store.getBookmark(0)
      const folder = await store.getFolder(bookmark.href)

      this.setState({
        state: 'LOADED_PINBOARD',
        lastUpdate,
        bookmarkCount: count,
        ttyIn: this.state.ttyIn,
        bookmark,
        folder,
        cursor: 0
      })

      return
    }

    // -- accurate bookmark information stored.
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

      await store.addBookmark(new Bookmark(bookmark))

      bookmarks.push(bookmark)
      bookmarkCount++
    }

    await store.setUpdateTime(lastUpdate.update_time)

    // -- update state as loaded.
    this.setState({
      state: 'LOADED_PINBOARD',
      bookmarkCount: bookmarks.length,
      cursor: 0,
      ttyIn: this.state.ttyIn
    })
  }

  /**
   * Initial setup for the Pin component. Load databases & bookmarks
   *
   * @returns
   */
  async componentDidMount(): Promise<void> {
    if (this.state.state === 'ERROR') {
      return
    }

    await this.state.browser.initialise()
    await this.state.store.initialise()
    await this.loadBookmarks()
  }

  /**
   * Render the CLI UI
   *
   * @returns a react-component
   */
  render(): any {
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
        bookmark: this.state.bookmark,
        store: this.state.store,
        folder: this.state.folder,
        active: this.state.active,
        folderBuffer: this.state.folderBuffer,
        predictedFolder: this.state.predictedFolder
      })
    }
  }
}
