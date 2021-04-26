

interface Keypress {
  ctrl: boolean
  name?: string
  shift?: boolean
}

/**
 * Handle any keypresses for this CLI
 *
 * @param _ ignored
 * @param key a keypress object
 *
 * @returns undefined
 */
async function handleKeyPress (state: any, _: any, key: Keypress | undefined): Promise<void> {
  if (state.state.state === 'LOADED_PINBOARD' && !state.state.active && key?.name === 'q') {
    process.exit(0)
  }

  if (typeof key !== 'undefined' && key.ctrl && (key.name === 'c' || key.name === 'z')) {
    process.exit(0)
  }

  if (state.state.state !== 'LOADED_PINBOARD' || typeof key === 'undefined') {
    return
  }

  const cursor = state.state.cursor

  if (cursor) {
    const bookmark = await state.state.store.getBookmark(cursor)
    const folder = await state.state.store.getFolder(bookmark.href)

    state.setState({
      ...state.state,
      cursor,
      bookmark,
      folder
    })
  }

  if (typeof key.name === 'undefined') {
    return
  }

  if (key.name === 'backspace' && state.state.active) {
    if (typeof state.state.folderBuffer === 'undefined') {
      return
    }
    state.setState({
      ...state.state,
      folderBuffer: state.state.folderBuffer.slice(0, -1)
    })
  }

  if (key.name === 'escape') {
    state.setState({
      ...state.state,
      active: false
    })

    return
  }

  if (key.name === 'return' && !state.state.active) {
    state.setState({
      ...state.state,
      active: true
    })

    return
  }
  if (key.name === 'return' && typeof state.state.folderBuffer !== 'undefined' && state.state.folderBuffer.length > 0) {
    // -- time to save!

    await state.saveFolder()

    const cursor = Math.min((state.state.cursor ?? 0) + 1, state.state.bookmarkCount - 1)
    const bookmark = await state.state.store.getBookmark(cursor)
    const folder = await state.state.store.getFolder(bookmark.href)

    state.setState({
      ...state.state,
      active: false,
      folderBuffer: [],
      predictedFolder: '',
      cursor,
      bookmark,
      folder
    })
    return
  }

  if (key.name === 'escape' && state.state.active) {
    state.setState({
      ...state.state,
      active: false
    })

    return
  }

  const { store } = state.state

  if (key.name === 'down' && !state.state.active) {
    const cursor = Math.min((state.state.cursor ?? 0) + 1, state.state.bookmarkCount - 1)
    const bookmark = await store.getBookmark(cursor)
    const folder = await store.getFolder(bookmark.href)

    state.setState({
      ...state.state,
      cursor,
      bookmark,
      folder
    })

    return
  }

  if (key.name === 'up' && !state.state.active) {
    const cursor = Math.max((state.state.cursor ?? 0) - 1, 0)

    const bookmark = await store.getBookmark(cursor)
    const folder = await store.getFolder(bookmark.href)

    state.setState({
      ...state.state,
      cursor,
      bookmark,
      folder
    })

    return
  }

  if (state.state.active) {
    // -- this is tricky, we need to exclude specials
    if (key.ctrl) {
      return
    }
    if (key.name.length > 1) {
      return
    }

    let name = key.name
    if (key.shift === true) {
      name = name.toUpperCase()
    }

    const folderBuffer = [...state.state.folderBuffer ?? [], name]
    const folderPrefix = folderBuffer.join('').trim()

    const extras = await state.state.store.getFolders()
    const folders = [...state.state.browser.folderNames(), ...extras]
      .map(folder => {
        return folder.trim().replace('/', '').toLowerCase()
      })
    const predictedFolder = folders.find(folder => {
      return folder.startsWith(folderPrefix.trim().toLowerCase())
    })

    state.setState({
      ...state.state,
      folderBuffer,
      predictedFolder: predictedFolder?.slice(folderPrefix.length)
    })
  }
}

export default handleKeyPress
